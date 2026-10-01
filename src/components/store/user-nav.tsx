"use client";

import * as React from "react";
import Link from "next/link";
import { User, LogOut, Package, MapPin, Heart, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOutAction } from "@/lib/auth/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserNav() {
  const [user, setUser] = React.useState<{
    id: string;
    email?: string;
    name?: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClient();

    const fetchSession = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch role and profile
        const [{ data: profile }, { data: roleRecord }] = await Promise.all([
          supabase.from("profiles").select("display_name").eq("id", authUser.id).single(),
          supabase.from("user_roles").select("role").eq("user_id", authUser.id).maybeSingle(),
        ]);

        setUser({
          id: authUser.id,
          email: authUser.email,
          name: profile?.display_name || authUser.email?.split("@")[0],
        });
        setIsAdmin(roleRecord?.role === "admin");
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
        });
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-lg bg-[var(--surface-hover)] animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/sign-in"
          className={cn(
            "flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold",
            "text-slate-700 dark:text-slate-200 transition-colors duration-150",
            "hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-[var(--primary)]"
          )}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="User account menu"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 select-none",
            "bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] text-white text-xs font-bold shadow-sm",
            "hover:ring-2 hover:ring-[var(--primary)]/30 active:scale-95"
          )}
        >
          {initial}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">
              {user.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-none truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2">
            <User className="h-4 w-4 text-[var(--text-muted)]" />
            <span>My Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/orders" className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[var(--text-muted)]" />
            <span>My Orders</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[var(--text-muted)]" />
            <span>Saved Addresses</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/account/wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-[var(--text-muted)]" />
            <span>Wishlist</span>
          </Link>
        </DropdownMenuItem>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin"
                className="flex items-center gap-2 text-[var(--primary)] font-medium"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Dashboard</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          destructive
          className="cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10 flex items-center gap-2"
          onSelect={async () => {
            try {
              const supabase = createClient();
              await supabase.auth.signOut();
              setUser(null);
              setIsAdmin(false);
              await signOutAction();
            } catch {
              window.location.href = "/sign-in";
            }
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
