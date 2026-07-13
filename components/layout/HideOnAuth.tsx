"use client";

import { usePathname } from "next/navigation";

const AUTH_ROUTES = new Set(["/login", "/signup", "/forgot-password"]);

/** Hides its children (e.g. the footer) on the focused auth routes. */
export function HideOnAuth({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname && AUTH_ROUTES.has(pathname)) return null;
  return <>{children}</>;
}
