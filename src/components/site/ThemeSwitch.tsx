"use client";

import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { useSiteTheme } from "./SiteThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const THEMES: { id: "minimal" | "dark" | "contemporary"; label: string }[] = [
  { id: "minimal", label: "Modern Minimal" },
  { id: "dark", label: "Luxury Dark" },
  { id: "contemporary", label: "Contemporary Luxury" },
];

export function ThemeSwitch() {
  const { theme, setTheme } = useSiteTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full border border-site-border text-site-foreground hover:bg-site-muted"
          aria-label="Schimbă tema"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-site-border shadow-site-lg">
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg py-2.5",
              theme === t.id && "bg-site-muted"
            )}
          >
            <span>{t.label}</span>
            {theme === t.id && (
              <motion.span initial={false} layoutId="theme-check">
                <Check className="h-4 w-4 text-site-accent" />
              </motion.span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
