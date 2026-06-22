"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, UserPlus, Briefcase, CalendarPlus } from "lucide-react";
import { cn } from "../../lib/utils";

export function QuickAddMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const triggerEvent = (eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* Sub Menu Items */}
      {isOpen && (
        <div className="flex flex-col items-end gap-2 mb-1 animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Add Contact */}
          <button
            onClick={() => triggerEvent("crm-open-add-contact")}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold rounded-md shadow-md cursor-pointer transition-colors"
          >
            <span>Add Contact</span>
            <span className="p-1 rounded-full bg-orange-100 text-orange-600">
              <UserPlus className="h-4 w-4" />
            </span>
          </button>

          {/* Add Deal */}
          <button
            onClick={() => triggerEvent("crm-open-add-deal")}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold rounded-md shadow-md cursor-pointer transition-colors"
          >
            <span>Add Deal</span>
            <span className="p-1 rounded-full bg-purple-100 text-purple-600">
              <Briefcase className="h-4 w-4" />
            </span>
          </button>

          {/* Add Activity */}
          <button
            onClick={() => triggerEvent("crm-open-add-activity")}
            className="flex items-center gap-2 px-3 py-2 bg-card border border-border text-foreground hover:bg-muted text-sm font-semibold rounded-md shadow-md cursor-pointer transition-colors"
          >
            <span>Log Activity / Task</span>
            <span className="p-1 rounded-full bg-blue-100 text-blue-600">
              <CalendarPlus className="h-4 w-4" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className={cn(
          "h-14 w-14 rounded-full flex items-center justify-center bg-primary text-white shadow-lg cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary z-50",
          isOpen ? "rotate-45" : ""
        )}
      >
        <Plus className="h-6 w-6 transition-transform duration-200" />
      </button>
    </div>
  );
}
export default QuickAddMenu;
