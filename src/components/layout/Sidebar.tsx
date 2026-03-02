"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Handshake,
  Home,
  Calendar,
  CheckSquare,
  FileText,
  UsersRound,
  BarChart3,
  Settings,
  Puzzle,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Lead-uri", href: "/leads", icon: UserCheck },
  { label: "Clienți", href: "/clients", icon: Users },
  { label: "Tranzacții", href: "/deals", icon: Handshake },
  { label: "Potriviri", href: "/matches", icon: Puzzle },
  { label: "Proprietăți", href: "/properties", icon: Home },
  { label: "Vizionări", href: "/viewings", icon: Calendar },
  { label: "Sarcini", href: "/tasks", icon: CheckSquare },
  { label: "Documente", href: "/documents", icon: FileText },
  { label: "Echipă", href: "/team", icon: UsersRound },
  { label: "Rapoarte", href: "/reports", icon: BarChart3 },
  { label: "Setări", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-purple-100/50 bg-gradient-to-b from-white to-purple-50/30">
      <div className="flex h-16 items-center border-b border-purple-100/50 px-4">
        <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent">
          Real Estate CRM
        </h2>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                  : "text-muted-foreground hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
