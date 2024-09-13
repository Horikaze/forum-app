import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import { Toaster } from "react-hot-toast";
import NavBarTop from "./components/navbar/NavBarTop";
import NavSide from "./components/navbar/NavSide";
import "./globals.css";
import SessionWrapper from "./providers/SessionWrapper";
import RecentPanel from "./components/RecentPanel";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "miau",
  description: "HUH",
};

export default function RootLayout({
  children,
  loginModal,
}: Readonly<{
  children: React.ReactNode;
  loginModal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} flex h-screen antialiased`}
        >
          <Toaster
            toastOptions={{
              style: {
                backgroundColor: "oklch(var(--a))",
                color: "oklch(var(--ac))",
              },
            }}
          />
          {loginModal}
          <div className="flex flex-1 overflow-hidden">
            <NavSide />
            <div className="flex flex-1 flex-col overflow-hidden">
              <NavBarTop />
              <main className="flex h-[calc(100vh-4rem)] justify-center gap-5 overflow-auto px-1 py-5">
                <div className="min-h-full max-w-7xl flex-1 [height:max-content] flex flex-col">
                  {children}
                </div>
                <RecentPanel />
              </main>
            </div>
          </div>
        </body>
      </SessionWrapper>
    </html>
  );
}
