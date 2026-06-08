import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { AppLayoutWrapper } from "../components/layout/app-layout-wrapper";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

export const metadata: Metadata = {
  title: {
    default: "Elara | Modern CRM for Teams",
    template: "%s | Elara",
  },
  description: "Elara is a modern, production-ready Customer Relationship Management application. Manage contacts, deals, and pipelines in one beautiful workspace.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
