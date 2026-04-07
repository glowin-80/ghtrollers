"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import AppProviders from "@/components/providers/AppProviders";

type RootAppShellProps = {
  children: ReactNode;
};

function isSfvofPath(pathname: string | null) {
  if (!pathname) {
    return false;
  }

  return pathname === "/sfvof" || pathname.startsWith("/sfvof/");
}

export default function RootAppShell({ children }: RootAppShellProps) {
  const pathname = usePathname();
  const renderSfvofShell = isSfvofPath(pathname);

  return (
    <div className="relative min-h-screen">
      {renderSfvofShell ? (
        <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,#edf2ee_0%,#f6f8f6_36%,#fbfcfb_100%)]" />
      ) : (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background: `
              linear-gradient(
                90deg,
                rgba(229,220,205,0.92) 0%,
                rgba(229,220,205,0.62) 14%,
                rgba(229,220,205,0.18) 28%,
                rgba(229,220,205,0.00) 42%,
                rgba(229,220,205,0.00) 58%,
                rgba(229,220,205,0.18) 72%,
                rgba(229,220,205,0.62) 86%,
                rgba(229,220,205,0.92) 100%
              ),
              radial-gradient(
                ellipse at center,
                rgba(255,255,255,0.00) 52%,
                rgba(229,220,205,0.20) 78%,
                rgba(229,220,205,0.38) 100%
              )
            `,
          }}
        />
      )}

      <div className="relative z-10">
        <AppProviders>{renderSfvofShell ? children : <><Header />{children}</>}</AppProviders>
      </div>
    </div>
  );
}
