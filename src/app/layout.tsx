import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import Script from "next/script";
import { LanguageProvider } from "@/lib/i18n";

// import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S.H.I.E.L.D. Security Dashboard",
  description: "S.H.I.E.L.D. Security Dashboard - Your Kubernetes Security Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
            <SidebarProvider>
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
