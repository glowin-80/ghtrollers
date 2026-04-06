"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { scrollToSection } from "@/components/header/header-navigation";

type HashSectionScrollerProps = {
  watchValues?: Array<string | number | boolean | null | undefined>;
};

export default function HashSectionScroller({
  watchValues = [],
}: HashSectionScrollerProps) {
  const pathname = usePathname();

  const watchKey = useMemo(() => {
    return watchValues.map((value) => String(value ?? "")).join("|");
  }, [watchValues]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const sectionId = hash.replace(/^#/, "");

    if (!sectionId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 60);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, watchKey]);

  return null;
}