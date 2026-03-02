"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserCheck,
  Handshake,
  Home,
  Calendar,
  Users,
  CheckSquare,
  FileText,
  UsersRound,
  BarChart3,
  Settings,
  ChevronUp,
  ChevronDown,
  Puzzle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bottomNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lead-uri", href: "/leads", icon: UserCheck },
  { label: "Tranzacții", href: "/deals", icon: Handshake },
  { label: "Potriviri", href: "/matches", icon: Puzzle },
  { label: "Proprietăți", href: "/properties", icon: Home },
  { label: "Vizionări", href: "/viewings", icon: Calendar },
];

/** Butoane doar în bara stângă pe mobil (restul față de bara de jos) */
const leftBarItems: NavItem[] = [
  { label: "Clienți", href: "/clients", icon: Users },
  { label: "Sarcini", href: "/tasks", icon: CheckSquare },
  { label: "Documente", href: "/documents", icon: FileText },
  { label: "Echipă", href: "/team", icon: UsersRound },
  { label: "Rapoarte", href: "/reports", icon: BarChart3 },
  { label: "Setări", href: "/settings", icon: Settings },
];

const navBarStyle =
  "border-purple-200/50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)]";

interface BottomNavProps {
  leftBarExpanded?: boolean;
  onLeftBarExpandChange?: (expanded: boolean) => void;
}

export function BottomNav({
  leftBarExpanded: leftBarExpandedProp,
  onLeftBarExpandChange,
}: BottomNavProps) {
  const pathname = usePathname();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isControlled = onLeftBarExpandChange != null;
  const leftBarExpanded = isControlled ? (leftBarExpandedProp ?? false) : internalExpanded;
  const touchStartY = useRef(0);

  const isOnDashboard = pathname === "/dashboard";
  const showLeftBarFull = isOnDashboard || leftBarExpanded;

  const setLeftBarExpanded = (v: boolean) => {
    if (isControlled) onLeftBarExpandChange?.(v);
    else setInternalExpanded(v);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const y = e.touches[0].clientY;
    if (touchStartY.current - y > 40) setLeftBarExpanded(true); // glisare în sus
  };

  return (
    <>
      {/* Bara stânga – pe dashboard mereu deschisă; altfel colapsată cu săgeată de deschidere */}
      {showLeftBarFull ? (
        <nav
          className={cn(
            "fixed bottom-0 left-0 z-50 flex w-[3.5rem] flex-col rounded-tr-xl border-t border-r border-purple-200/60 overflow-hidden",
            "h-[42vh] max-h-[320px] min-h-[200px]",
            "bg-white/98 backdrop-blur-xl shadow-lg",
            "lg:hidden"
          )}
        >
          {/* Buton Închide – fix deasupra, compact */}
          {!isOnDashboard && (
            <button
              type="button"
              onClick={() => setLeftBarExpanded(false)}
              className="shrink-0 h-9 w-full flex items-center justify-center border-b border-purple-100 bg-purple-50/80 text-purple-700 hover:bg-purple-100/80"
              aria-label="Închide meniul"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          )}
          {/* Listă butoane – scrollabilă dacă nu încap toate */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1.5 px-1">
            <div className="flex flex-col items-center gap-0.5">
              {leftBarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.label}
                    className={cn(
                      "flex shrink-0 w-full flex-col items-center justify-center gap-0.5 rounded-md py-1.5 px-0.5 min-h-[2.75rem]",
                      "transition-colors",
                      isActive ? "text-purple-600 bg-purple-100/70" : "text-muted-foreground hover:bg-purple-50/50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive && "scale-110")} />
                    <span className="text-[8px] font-medium leading-tight truncate w-full text-center max-w-full">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      ) : (
        <nav
          className={cn(
            "fixed bottom-0 left-0 z-50 flex w-14 flex-col items-center justify-center rounded-tr-xl border-t border-r",
            "h-14 min-h-[3.5rem]",
            navBarStyle,
            "lg:hidden"
          )}
          role="button"
          tabIndex={0}
          onClick={() => setLeftBarExpanded(true)}
          onKeyDown={(e) => e.key === "Enter" && setLeftBarExpanded(true)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          aria-label="Deschide meniul"
        >
          <ChevronUp className="h-6 w-6 text-purple-600" />
          <span className="text-[9px] font-medium text-muted-foreground mt-0.5">Meniul</span>
        </nav>
      )}

      {/* Bara de jos – de la marginea barei stângi până la dreapta */}
      <nav
        className={cn(
          "fixed bottom-0 left-14 right-0 z-50 border-t",
          navBarStyle,
          "lg:hidden"
        )}
      >
        <div className="flex h-16 items-center justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all",
                  isActive ? "text-purple-600" : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "rounded-xl p-2 transition-all",
                    isActive && "bg-gradient-to-br from-purple-100 to-pink-100"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
                </div>
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
