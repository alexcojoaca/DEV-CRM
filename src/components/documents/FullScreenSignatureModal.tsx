"use client";

import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Save, Eraser } from "lucide-react";

interface FullScreenSignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (dataUrl: string) => void;
  value: string;
  title?: string;
}

export function FullScreenSignatureModal({
  open,
  onClose,
  onSave,
  value,
  title = "Semnătură",
}: FullScreenSignatureModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const getPoint = useCallback((e: React.TouchEvent | React.MouseEvent) => {
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
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
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
    [getPoint]
  );

  const move = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const p = getPoint(e);
      if (!p) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    },
    [getPoint]
  );

  const end = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
    onClose();
  }, [onSave, onClose]);

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Resize canvas to container (landscape: 16/9) and load initial value
  useEffect(() => {
    if (!open || !containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w <= 0 || h <= 0) return;

    canvas.width = w;
    canvas.height = h;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    if (value && value.startsWith("data:image")) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = value;
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black"
      style={{ height: "100dvh", maxHeight: "100dvh" }}
    >
      <div
        className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-700 px-4 py-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <h2 className="text-lg font-semibold text-white truncate flex-1 min-w-0">{title}</h2>
        <Button type="button" variant="outline" size="sm" onClick={handleClear} className="shrink-0 border-gray-500 text-white hover:bg-gray-800">
          <Eraser className="h-4 w-4 mr-1" />
          Curăță
        </Button>
        <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Închide" className="shrink-0 text-white hover:bg-gray-800">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="w-full touch-none mx-auto flex-1 min-h-0 flex items-center justify-center p-2" style={{ minHeight: 0 }}>
        <div
          ref={containerRef}
          className="w-full touch-none bg-white rounded-lg overflow-hidden shadow-lg"
          style={{
            aspectRatio: "16 / 9",
            maxWidth: "100%",
            maxHeight: "min(56.25vw, calc(100dvh - 180px))",
          }}
        >
          <canvas
            ref={canvasRef}
            className="block w-full h-full touch-none"
            style={{ touchAction: "none" }}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
          onTouchCancel={end}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          />
        </div>
      </div>

      <div
        className="shrink-0 border-t border-gray-700 p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <Button
          type="button"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          size="lg"
          onClick={handleSave}
        >
          <Save className="mr-2 h-5 w-5" />
          Salvează
        </Button>
      </div>
    </div>
  );
}
