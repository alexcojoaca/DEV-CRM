"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Formatează numărul cu punct ca separator de mii (ex: 100.000) */
export function formatPriceDisplay(value: number): string {
  if (value === 0 || Number.isNaN(value)) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/** Extrage doar cifrele și returnează numărul */
export function parsePriceInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return 0;
  const num = parseInt(digits, 10);
  return Number.isNaN(num) ? 0 : num;
}

interface PriceInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function PriceInput({
  id = "price",
  value,
  onChange,
  currency = "EUR",
  placeholder = "ex: 150.000",
  className,
  label,
}: PriceInputProps) {
  const displayValue = formatPriceDisplay(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parsePriceInput(e.target.value);
    onChange(num);
  };

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={id}>
          {label} {currency && `(${currency})`}
        </Label>
      )}
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="border-purple-200 mt-1.5"
      />
    </div>
  );
}
