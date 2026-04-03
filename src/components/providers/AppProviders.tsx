"use client";

import type { ReactNode } from "react";
import { AuthMemberProvider } from "@/components/providers/AuthMemberProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <AuthMemberProvider>{children}</AuthMemberProvider>;
}
