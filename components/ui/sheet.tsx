"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Sheet({ isOpen, onClose, children }: SheetProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200" />
        
        {/* Sliding Panel */}
        <Dialog.Content className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col h-full animate-in slide-in-from-right duration-350 ease-out focus:outline-none">
          {children}
          
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 border-b border-border bg-muted/20 shrink-0", className)}
      {...props}
    />
  );
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-lg font-bold text-card-foreground", className)}
      {...props}
    />
  );
}

export function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/10 shrink-0", className)}
      {...props}
    />
  );
}
