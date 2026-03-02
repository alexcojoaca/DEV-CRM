"use client";

import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  disabled?: boolean;
  /** Dimensiuni canvas (imagine exportată). Default 400x140. Pentru semnătură client mai mare: ex. 560x220 */
  width?: number;
  height?: number;
}

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 140;

export function SignaturePad({ value, onChange, label = "Semnătura client", disabled, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const start = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (disabled) return;
      const p = getPoint(e);
      if (!p) return;
      isDrawing.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    },
    [disabled, getPoint]
  );

  const move = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current || disabled) return;
      const p = getPoint(e);
      if (!p) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    },
    [disabled, getPoint]
  );

  const end = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onChange(dataUrl);
  }, [onChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [onChange]);

  // Init canvas size (fixed buffer for consistent export)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = width;
    const h = height;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
      }
    }
  }, [width, height]);

  // Load value (image) into canvas when value is set externally; clear when empty
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!value || !value.startsWith("data:image")) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = value;
  }, [value]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-lg border-2 border-dashed border-purple-200 bg-white p-2">
        <canvas
          ref={canvasRef}
          className="block w-full touch-none cursor-crosshair rounded border border-gray-200"
          style={{ width: "100%", height }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          onTouchCancel={end}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={clear} disabled={disabled}>
        Șterge semnătura
      </Button>
    </div>
  );
}
