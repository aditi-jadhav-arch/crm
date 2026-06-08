"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { 
  LayoutDashboard, 
  User, 
  Building2, 
  Briefcase, 
  CalendarCheck, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  ShieldAlert 
} from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";
import { cn } from "../../lib/utils";
import { Avatar } from "../ui/custom-avatar";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { userProfile, logout } = useAuth();

  const navLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Contacts", href: "/contacts", icon: User },
    { name: "Companies", href: "/companies", icon: Building2 },
    { name: "Deals", href: "/deals", icon: Briefcase },
    { name: "Activities", href: "/activities", icon: CalendarCheck },
    { name: "Reports", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Sidebar backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 flex flex-col h-full",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* App Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-sidebar-border select-none bg-sidebar shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <rect width="32" height="32" rx="7" ry="7" fill="#c96442"/>
            <text x="16" y="23" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" fontSize="20" fontWeight="800" fill="#ffffff" textAnchor="middle" letterSpacing="-0.5">E</text>
          </svg>
          <span className="font-extrabold text-lg tracking-tight text-sidebar-foreground">
            Elara
          </span>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            // Check if pathname starts with the link's href, except for dashboard
            const isActive = link.href === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-semibold transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary shadow-xs border-r-3 border-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar/50 shrink-0 space-y-4">
          {/* User profile details */}
          {userProfile && (
            <div className="flex items-center gap-3">
              <Avatar 
                name={userProfile.displayName} 
                avatarUrl={userProfile.photoURL} 
                size="sm"
                className="ring-2 ring-sidebar-primary/20"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-sidebar-foreground truncate">
                  {userProfile.displayName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {userProfile.email}
                </div>
              </div>
            </div>
          )}

          {/* Action Row: Theme toggle & Logout */}
          <div className="flex items-center justify-between gap-2 border-t border-sidebar-border/50 pt-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              type="button"
              className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-accent-foreground transition-colors cursor-pointer"
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer ml-auto"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
export default Sidebar;
