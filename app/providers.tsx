"use client";

import React from "react";
import { AuthContextProvider } from "../lib/context/auth-context";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
      <AuthContextProvider>
        {children}
        <Toaster position="top-right" richColors />
      </AuthContextProvider>
    </ThemeProvider>
  );
}
