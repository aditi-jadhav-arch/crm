"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Menu, 
  Bell, 
  Search, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  LogOut,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../../lib/hooks/useAuth";
import { useContacts } from "../../lib/hooks/useContacts";
import { useCompanies } from "../../lib/hooks/useCompanies";
import { useDeals } from "../../lib/hooks/useDeals";
import { useDashboardStats } from "../../lib/hooks/useDashboardStats";
import { SearchResults } from "../ui/search-results";
import { Avatar } from "../ui/custom-avatar";
import { cn } from "../../lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useAuth();
  const { stats } = useDashboardStats();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch collections for global search
  const { contacts } = useContacts();
  const { companies } = useCompanies();
  const { deals } = useDeals();

  // Close menus when clicking outside
  useEffect(() => {
    function clickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // Determine dynamic page title
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname === "/contacts") return "Contacts";
    if (pathname.startsWith("/contacts/")) return "Contact Details";
    if (pathname === "/companies") return "Companies";
    if (pathname.startsWith("/companies/")) return "Company Details";
    if (pathname === "/deals") return "Deals Pipeline";
    if (pathname.startsWith("/deals/")) return "Deal Details";
    if (pathname === "/activities") return "Activities & Tasks";
    if (pathname === "/reports") return "Reports & Analytics";
    if (pathname === "/settings") return "Settings";
    return "Elara";
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-30 shrink-0 select-none shadow-xs">
      {/* Page Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          type="button"
          className="p-1.5 rounded-md hover:bg-muted text-foreground md:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Search Bar */}
      <div ref={searchRef} className="relative flex-1 max-w-sm md:max-w-md mx-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search contacts, companies, deals..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearch(true);
            }}
            onFocus={() => setShowSearch(true)}
            className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        
        {/* Search Results Dropdown Overlay */}
        {showSearch && searchQuery && (
          <SearchResults
            query={searchQuery}
            contacts={contacts}
            companies={companies}
            deals={deals}
            onResultClick={() => {
              setSearchQuery("");
              setShowSearch(false);
            }}
          />
        )}
      </div>

      {/* Notifications & Profile dropdown */}
      <div className="flex items-center gap-4">
        {/* Notifications Icon with Badge */}
        <Link
          href="/activities"
          className="relative p-2 rounded-full hover:bg-muted text-foreground transition-colors cursor-pointer"
          title={`${stats.tasksDueToday || 0} tasks due today`}
        >
          <Bell className="h-4 w-4" />
          {stats.tasksDueToday > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
              {stats.tasksDueToday}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown Menu */}
        {userProfile && (
          <div ref={profileMenuRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-full md:rounded-md hover:bg-muted text-foreground cursor-pointer transition-colors focus:outline-none"
            >
              <Avatar
                name={userProfile.displayName}
                avatarUrl={userProfile.photoURL}
                size="sm"
                className="ring-1 ring-border"
              />
              <span className="text-sm font-semibold hidden md:inline-block max-w-[120px] truncate">
                {userProfile.displayName}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:inline-block" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-border/50 text-xs text-muted-foreground">
                  Logged in as <span className="font-semibold text-foreground truncate block">{userProfile.email}</span>
                </div>
                
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer font-semibold"
                >
                  <UserIcon className="h-4 w-4" />
                  My Profile
                </Link>
                
                <Link
                  href="/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer font-semibold"
                >
                  <SettingsIcon className="h-4 w-4" />
                  Settings
                </Link>

                <div className="border-t border-border/50 my-1" />
                
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  type="button"
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left transition-colors cursor-pointer font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
export default Header;
