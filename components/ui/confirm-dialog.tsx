import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in" />
        
        {/* Content Box */}
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-md bg-card border border-border p-6 rounded-lg shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150 focus:outline-none">
          <Dialog.Title className="text-lg font-bold text-card-foreground">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mt-2">
            {description}
          </Dialog.Description>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 border border-border rounded-md text-sm font-semibold hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              type="button"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-semibold transition-colors cursor-pointer",
                isDestructive 
                  ? "bg-destructive text-destructive-foreground hover:opacity-90" 
                  : "bg-primary text-primary-foreground hover:opacity-90"
              )}
            >
              {confirmText}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export default ConfirmDialog;
