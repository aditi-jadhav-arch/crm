import React from "react";
import { cn } from "../../lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ScrollArea({ children, className, ...props }: ScrollAreaProps) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto scrollbar-thin px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
export default ScrollArea;
