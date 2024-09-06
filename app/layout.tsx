import type { Metadata } from "next";
import localFont from "next/font/local";
import React from "react";
import { Toaster } from "react-hot-toast";
import NavBarTop from "./components/navbar/NavBarTop";
import NavSide from "./components/navbar/NavSide";
import "./globals.css";
import SessionWrapper from "./providers/SessionWrapper";
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
              <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-auto">
                <div className="container flex-1 px-2 py-5">{children}</div>
              </main>
            </div>
          </div>
        </body>
      </SessionWrapper>
    </html>
  );
}
