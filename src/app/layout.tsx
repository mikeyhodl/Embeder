import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/app/Theme-provider";
import { initializeDatabase } from "../lib/db";

const inter = Inter({ subsets: ["latin"] });

// Initialize database on server startup
initializeDatabase().catch(console.error);

export const metadata: Metadata = {
  title: "Skool CRM",
  description: "Skool CRM",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className + " min-h-screen"}>
        <Toaster position="bottom-left" reverseOrder={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
