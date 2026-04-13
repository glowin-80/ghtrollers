import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { NavItem } from "@/components/header/header-config";

function getNavOffset() {
  const nav = document.getElementById("site-nav");
  return nav ? nav.offsetHeight + 20 : 20;
}

export function scrollToSection(sectionId: string, attempt = 0) {
  const element = document.getElementById(sectionId);

  if (!element) {
    if (attempt < 40) {
      window.setTimeout(() => {
        scrollToSection(sectionId, attempt + 1);
      }, 120);
    }
    return;
  }

  const targetPosition =
    element.getBoundingClientRect().top + window.scrollY - getNavOffset();

  window.scrollTo({ top: Math.max(targetPosition, 0), behavior: "smooth" });
}

function navigateToHref(href: string, pathname: string, router: AppRouterInstance) {
  const [rawPath, rawHash] = href.split("#");
  const targetPath = rawPath || "/";
  const targetHash = rawHash ?? "";

  if (pathname === targetPath && targetHash) {
    window.history.replaceState(null, "", `${targetPath}#${targetHash}`);
    scrollToSection(targetHash);
    return;
  }

  if (pathname === targetPath && !targetHash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  router.push(targetHash ? `${targetPath}#${targetHash}` : targetPath);
}

export function getPathActiveItem(pathname: string): string | null {
  if (pathname === "/galleri") return "gallery";
  if (pathname === "/markera-fiskeplats") return "markera-fiskeplats";
  if (pathname === "/achievements" || pathname === "/achievements/gaddhang") return "achievements";
  return null;
}

export function performNavigation(options: {
  item: NavItem;
  isLoggedIn: boolean;
  pathname: string;
  router: AppRouterInstance;
  setIsMobileMenuOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  setActiveSection: (value: string) => void;
}) {
  const { item, isLoggedIn, pathname, router, setIsMobileMenuOpen, setActiveSection } = options;

  if (item.type === "section" && item.section) {
    setIsMobileMenuOpen(false);
    setActiveSection(item.id);
    navigateToHref(`/#${item.section}`, pathname, router);
    return;
  }

  if (item.type === "route" && item.href) {
    setIsMobileMenuOpen(false);
    navigateToHref(item.href, pathname, router);
    return;
  }

  if (item.type === "action") {
    setIsMobileMenuOpen(false);

    if (isLoggedIn) {
      if (pathname === "/min-sida") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      router.push("/min-sida");
      return;
    }

    router.push("/login");
  }
}