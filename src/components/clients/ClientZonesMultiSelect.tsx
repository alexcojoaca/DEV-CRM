"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface ClientZonesMultiSelectProps {
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function ClientZonesMultiSelect({
  value,
  options,
  onChange,
  placeholder = "— Alege zone —",
  className,
}: ClientZonesMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((z) =>
    z.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const toggleZone = (zone: string) => {
    if (value.includes(zone)) {
      onChange(value.filter((z) => z !== zone));
    } else {
      onChange([...value, zone]);
    }
  };

  const label =
    value.length === 0
      ? placeholder
      : value.length <= 2
        ? value.join(", ")
        : `${value.length} zone selectate`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-purple-200 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
        >
          <span className={value.length ? "text-foreground" : "text-muted-foreground"}>
            {label}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(320px,100vw-2rem)] p-0" align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Caută zona..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 border-0 bg-muted/50 pl-8 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </div>
        <div className="max-h-[260px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nicio zonă găsită.
            </p>
          ) : (
            filtered.map((zone) => {
              const checked = value.includes(zone);
              return (
                <button
                  key={zone}
                  type="button"
                  onClick={() => toggleZone(zone)}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-sm px-2 py-2 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    checked && "bg-purple-100 text-purple-900 hover:bg-purple-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleZone(zone)}
                      className="h-4 w-4"
                    />
                    <span>{zone}</span>
                  </span>
                  {checked && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

