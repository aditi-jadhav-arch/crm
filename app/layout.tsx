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
  title: "CRM Core - Customer Relationship Management",
  description: "A secure, production-ready Customer Relationship Management application built with Next.js, Tailwind CSS v4, and Firebase.",
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
