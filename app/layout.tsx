import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BusinessProvider } from "./context/BusinessContext";
import { TopNavbar } from "../components/layout/TopNavbar";
import { LeftNavbar } from "../components/layout/LeftNavbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Multi-business admin management panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}
      >
        <BusinessProvider>
          <div className="flex flex-col min-h-screen">
            <TopNavbar />
            <div className="flex flex-1">
              <LeftNavbar />
              <main className="flex-1 p-8 overflow-y-auto h-[calc(100vh-4rem)]">
                {children}
              </main>
            </div>
          </div>
        </BusinessProvider>
      </body>
    </html>
  );
}
