import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { LanguageProvider } from "@/lib/i18n";

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
    <LanguageProvider>
      <html lang="en">
        <head>
          <title>S.H.I.E.L.D. Security Dashboard</title>
          <meta
            name="description"
            content="S.H.I.E.L.D. Security Dashboard - Your Kubernetes Security Hub"
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen flex bg-[#151c24] text-white">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col min-h-screen bg-[#f7f8fa] text-black">
              {children}
            </div>
          </div>
        </body>
      </html>
    </LanguageProvider>
  );
}
