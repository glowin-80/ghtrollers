"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import AppProviders from "@/components/providers/AppProviders";

export default function RootAppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isSfvofRoute = pathname?.startsWith("/sfvof") ?? false;

  if (isSfvofRoute) {
    return (
      <div className="relative min-h-screen bg-[#edf2f0]">
        <div className="relative z-10">
          <AppProviders>{children}</AppProviders>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
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

      <div className="relative z-10">
        <AppProviders>
          <Header />
          {children}
        </AppProviders>
      </div>
    </div>
  );
}
