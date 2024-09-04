"use client";

import { SessionProvider } from "next-auth/react";
import { useEffect } from "react";
import { themeChange } from "theme-change";
export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    themeChange(false);
    // 👆 false parameter is required for react project
  }, []);
  return <SessionProvider>{children}</SessionProvider>;
}
