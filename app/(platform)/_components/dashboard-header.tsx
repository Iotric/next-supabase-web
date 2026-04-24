"use client";

import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AuthUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/client";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DashboardHeader({ user }: { user: AuthUser }) {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed out");
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="bg-background sticky top-0 z-10 border-b">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground grid h-7 w-7 place-items-center rounded-md text-xs font-bold">
            N
          </div>
          <span className="font-semibold tracking-tight">Next Supabase Web</span>
          <Badge variant="secondary" className="ml-1">
            dev
          </Badge>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-9 items-center gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[11px]">{initials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="text-left leading-tight">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-muted-foreground text-xs">{user.role}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
              {user.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon className="size-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="size-4" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={signOut}>
              <LogOut className="size-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
