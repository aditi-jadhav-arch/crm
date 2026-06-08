"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/hooks/useAuth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { QuickAddMenu } from "../ui/quick-add-menu";
import { AddContactSheet } from "../contacts/add-contact-sheet";
import { AddDealSheet } from "../deals/add-deal-sheet";
import { AddActivitySheet } from "../activities/add-activity-sheet";

interface AppLayoutWrapperProps {
  children: React.ReactNode;
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactSheetOpen, setContactSheetOpen] = useState(false);
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isPublicPage = pathname === "/";

  useEffect(() => {
    if (!loading) {
      if (!user && !isAuthPage && !isPublicPage) {
        router.replace("/login");
      } else if (user && isAuthPage) {
        router.replace("/dashboard");
      }
    }
  }, [user, loading, isAuthPage, isPublicPage, router]);

  // Listen for global quick action triggers
  useEffect(() => {
    const openContact = () => setContactSheetOpen(true);
    const openDeal = () => setDealSheetOpen(true);
    const openActivity = () => setActivitySheetOpen(true);

    window.addEventListener("crm-open-add-contact", openContact);
    window.addEventListener("crm-open-add-deal", openDeal);
    window.addEventListener("crm-open-add-activity", openActivity);

    return () => {
      window.removeEventListener("crm-open-add-contact", openContact);
      window.removeEventListener("crm-open-add-deal", openDeal);
      window.removeEventListener("crm-open-add-activity", openActivity);
    };
  }, []);

  // Public landing page - render immediately, never block on auth loading
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Auth pages (login/register) - render immediately too
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Loading state visual wrapper (only for protected dashboard routes)
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center select-none">
        <div className="h-10 w-10 border-3 border-t-primary border-r-border border-b-border border-l-border rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-muted-foreground tracking-wide animate-pulse">
          Loading Elara...
        </span>
      </div>
    );
  }

  // Redirecting state blank screen
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {/* Empty placeholder while redirecting */}
      </div>
    );
  }

  // Dashboard layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation Drawer */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      {/* Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 relative">
          {children}
          {/* Global floating quick-actions button */}
          <QuickAddMenu />
        </main>
      </div>

      {/* Global Slide-over Creation Panels */}
      <AddContactSheet 
        isOpen={contactSheetOpen} 
        onClose={() => setContactSheetOpen(false)} 
      />
      <AddDealSheet 
        isOpen={dealSheetOpen} 
        onClose={() => setDealSheetOpen(false)} 
      />
      <AddActivitySheet 
        isOpen={activitySheetOpen} 
        onClose={() => setActivitySheetOpen(false)} 
      />
    </div>
  );
}
export default AppLayoutWrapper;
