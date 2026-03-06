"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [leftBarExpanded, setLeftBarExpanded] = useState(false);
  const isOnDashboard = pathname === "/dashboard";
  const showLeftBarFull = isOnDashboard || leftBarExpanded;

  return (
    <div className="flex h-mobile-safe flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>

        {/* Main Content – pe telefon: full width când bara e închisă, se dă în dreapta doar când bara e deschisă */}
        <main
          className={cn(
            "flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/10 transition-[padding] duration-200",
            showLeftBarFull ? "max-lg:pl-14" : "max-lg:pl-0",
            "lg:pl-0"
          )}
        >
          <div className="container mx-auto p-4 pb-20 lg:pb-4">{children}</div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav
        leftBarExpanded={leftBarExpanded}
        onLeftBarExpandChange={setLeftBarExpanded}
      />
    </div>
  );
}
