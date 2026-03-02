"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/session/useSession";
import { User, LogOut, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

const roleTranslations: Record<string, string> = {
  OWNER: "Proprietar",
  MANAGER: "Manager",
  AGENT: "Agent",
};

export function Topbar() {
  const router = useRouter();
  const { user, organization } = useSession();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="flex h-16 items-center justify-between border-b border-purple-100/50 bg-white/80 backdrop-blur-xl px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent">
          {organization?.name || "Agenție Imobiliară"}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-xl p-1.5 transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
              <Avatar className="h-9 w-9 ring-2 ring-purple-200">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-xs font-semibold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left text-sm md:block">
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user?.role ? roleTranslations[user.role] || user.role : ""}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Setări</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Deconectare</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
