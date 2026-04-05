"use client";

import MemberButton from "@/components/shared/MemberButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";

type NavItem = {
  id: string;
  src?: string;
  label?: string;
  section?: string;
  href?: string;
  alt: string;
  type: "section" | "route" | "action";
};

const desktopGraphicItems: NavItem[] = [
  {
    id: "leaderboard",
    src: "/nav/leaderboard.png",
    label: "Leaderboard",
    section: "leaderboard-section",
    alt: "Leaderboard",
    type: "section",
  },
  {
    id: "upload",
    src: "/nav/laddaUpp.png",
    label: "Ladda upp fångst",
    section: "upload-section",
    alt: "Ladda upp fångst",
    type: "section",
  },
  {
    id: "gallery",
    src: "/nav/galleri.png",
    label: "Galleri",
    href: "/galleri",
    alt: "Galleri",
    type: "route",
  },
  {
    id: "map",
    src: "/nav/karta.png",
    label: "Karta",
    section: "map-section",
    alt: "Karta",
    type: "section",
  },
];

const mobileMenuItems: NavItem[] = [
  {
    id: "home",
    label: "Startsida",
    href: "/",
    alt: "Startsida",
    type: "route",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    section: "leaderboard-section",
    alt: "Leaderboard",
    type: "section",
  },
  {
    id: "upload",
    label: "Ladda upp fångst",
    section: "upload-section",
    alt: "Ladda upp fångst",
    type: "section",
  },
  {
    id: "approved",
    label: "Nya godkända fångster",
    section: "approved-section",
    alt: "Nya godkända fångster",
    type: "section",
  },
  {
    id: "gallery",
    label: "Galleri",
    href: "/galleri",
    alt: "Galleri",
    type: "route",
  },
  {
    id: "map",
    label: "Karta",
    section: "map-section",
    alt: "Karta",
    type: "section",
  },
  {
    id: "all-time-high",
    label: "All-time-high",
    href: "/all-time-high",
    alt: "All-time-high",
    type: "route",
  },
];

function getNavOffset() {
  const nav = document.getElementById("site-nav");
  return nav ? nav.offsetHeight + 20 : 20;
}

function scrollToSection(sectionId: string, attempt = 0) {
  const element = document.getElementById(sectionId);

  if (!element) {
    if (attempt < 14) {
      window.setTimeout(() => {
        scrollToSection(sectionId, attempt + 1);
      }, 80);
    }
    return;
  }

  const targetPosition =
    element.getBoundingClientRect().top + window.scrollY - getNavOffset();

  window.scrollTo({
    top: Math.max(targetPosition, 0),
    behavior: "smooth",
  });
}

function getMobileCardTheme(itemId: string) {
  switch (itemId) {
    case "home":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#f4e7ca_0%,#e2cfab_100%)] text-[#35291b]",
        iconCircle:
          "border-[#ccb175] bg-[linear-gradient(180deg,#fff5de_0%,#ecd8b3_100%)] text-[#5e4829]",
        arrow:
          "text-[#5c472a]",
      };
    case "leaderboard":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#40596d_0%,#283946_100%)] text-[#f7e8c3]",
        iconCircle:
          "border-[#8ba0b1] bg-[linear-gradient(180deg,#5a7488_0%,#334957_100%)] text-[#f3ddb0]",
        arrow:
          "text-[#ecd8a5]",
      };
    case "upload":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#445842_0%,#293622_100%)] text-[#f1e2bb]",
        iconCircle:
          "border-[#7f916f] bg-[linear-gradient(180deg,#566c52_0%,#37442f_100%)] text-[#ecd8a5]",
        arrow:
          "text-[#ecd8a5]",
      };
    case "approved":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#f6eee0_0%,#e8dbc3_100%)] text-[#3c2f22]",
        iconCircle:
          "border-[#ccb175] bg-[linear-gradient(180deg,#fff8eb_0%,#eee0c6_100%)] text-[#654f31]",
        arrow:
          "text-[#654f31]",
      };
    case "gallery":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#876138_0%,#614122_100%)] text-[#f8e9c6]",
        iconCircle:
          "border-[#b88c57] bg-[linear-gradient(180deg,#9d7750_0%,#734c2a_100%)] text-[#f4ddb2]",
        arrow:
          "text-[#f4ddb2]",
      };
    case "map":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#567a75_0%,#375552_100%)] text-[#f2e3bf]",
        iconCircle:
          "border-[#88a79f] bg-[linear-gradient(180deg,#72958f_0%,#4a6964_100%)] text-[#f0ddb1]",
        arrow:
          "text-[#f0ddb1]",
      };
    case "all-time-high":
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#ede2cb_0%,#d8c8a7_100%)] text-[#372b1d]",
        iconCircle:
          "border-[#ccb175] bg-[linear-gradient(180deg,#f8efd9_0%,#e6d3ae_100%)] text-[#5d4727]",
        arrow:
          "text-[#5d4727]",
      };
    default:
      return {
        outer:
          "border-[#bfa76a] bg-[linear-gradient(180deg,#f6eee0_0%,#e8dbc3_100%)] text-[#3c2f22]",
        iconCircle:
          "border-[#ccb175] bg-[linear-gradient(180deg,#fff8eb_0%,#eee0c6_100%)] text-[#654f31]",
        arrow:
          "text-[#654f31]",
      };
  }
}

function getFallbackIcon() {
  return "★";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, profileImageUrl } = useAuthMember();

  const [active, setActive] = useState("leaderboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/galleri") {
      setActive("gallery");
      setIsMobileMenuOpen(false);
      return;
    }

    if (pathname === "/all-time-high") {
      setIsMobileMenuOpen(false);
      return;
    }

    if (pathname === "/") {
      setIsMobileMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!mobileMenuRef.current) return;

      const target = event.target as Node | null;
      if (target && !mobileMenuRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname !== "/") return;

    const hash = window.location.hash;
    if (!hash) return;

    const sectionId = hash.replace(/^#/, "");
    const timer = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 60);

    return () => {
      window.clearTimeout(timer);
    };
  }, [pathname]);

  const desktopNavItems = useMemo<NavItem[]>(() => {
    return [
      ...desktopGraphicItems,
      {
        id: "account",
        src: "/nav/loggaIn.png",
        label: isLoggedIn ? "Min sida" : "Logga in",
        alt: isLoggedIn ? "Min sida" : "Logga in",
        type: "action",
      },
    ];
  }, [isLoggedIn]);

  function navigateToHref(href: string) {
    const [rawPath, rawHash] = href.split("#");
    const targetPath = rawPath || "/";
    const targetHash = rawHash ?? "";

    if (pathname === targetPath && targetHash) {
      window.history.replaceState(null, "", `${targetPath}#${targetHash}`);
      scrollToSection(targetHash);
      return;
    }

    if (pathname === targetPath && !targetHash) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    router.push(targetHash ? `${targetPath}#${targetHash}` : targetPath);
  }

  function performNavigation(item: NavItem) {
    if (item.type === "section" && item.section) {
      setIsMobileMenuOpen(false);

      if (item.id === "leaderboard") setActive("leaderboard");
      if (item.id === "upload") setActive("upload");
      if (item.id === "map") setActive("map");

      navigateToHref(`/#${item.section}`);
      return;
    }

    if (item.type === "route" && item.href) {
      setIsMobileMenuOpen(false);

      if (item.id === "gallery") {
        setActive("gallery");
      }

      navigateToHref(item.href);
      return;
    }

    if (item.type === "action") {
      setIsMobileMenuOpen(false);

      if (isLoggedIn) {
        if (pathname === "/min-sida") {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          return;
        }

        router.push("/min-sida");
        return;
      }

      router.push("/login");
    }
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  function renderMobileMenuButton(item: NavItem) {
    const theme = getMobileCardTheme(item.id);
    const isCurrentRoute =
      item.type === "route" &&
      ((item.href === "/" && pathname === "/") || item.href === pathname);

    const isCurrentSection =
      pathname === "/" &&
      item.type === "section" &&
      ((item.id === "leaderboard" && active === "leaderboard") ||
        (item.id === "upload" && active === "upload") ||
        (item.id === "map" && active === "map"));

    const isActive = isCurrentRoute || isCurrentSection;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => performNavigation(item)}
        className={[
          "group relative flex w-full items-center gap-3 overflow-hidden rounded-full border px-3 py-[7px] text-left shadow-[0_8px_18px_rgba(0,0,0,0.14)] transition-all duration-200",
          "min-h-[48px] active:scale-[0.99]",
          isActive ? "scale-[1.01]" : "hover:scale-[1.01]",
          theme.outer,
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/10" />

        <div
          className={[
            "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
            theme.iconCircle,
          ].join(" ")}
          aria-hidden="true"
        >
          <span className="text-[14px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">
            {getFallbackIcon()}
          </span>
        </div>

        <div className="min-w-0 flex-1 pr-1">
          <div className="truncate text-[14px] font-semibold leading-[1.05] tracking-[0.01em]">
            {item.label}
          </div>
        </div>

        <div
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-[1px]",
            theme.arrow,
          ].join(" ")}
          aria-hidden="true"
        >
          <span className="text-[18px] leading-none">›</span>
        </div>
      </button>
    );
  }

  return (
    <>
      <header className="w-full">
        <div className="relative h-[140px] w-full overflow-hidden sm:h-[320px] md:h-[380px]">
          <img
            src="/header.png"
            alt="Gäddhäng Trollers"
            className="h-full w-full object-cover object-[center_35%]"
            draggable={false}
          />
        </div>
      </header>

      <div
        id="site-nav"
        className="sticky top-0 z-50 border-b border-black/10 bg-[#e5dccd]/95 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
          <div ref={mobileMenuRef} className="relative sm:hidden">
            <div className="flex items-center gap-[6px]">
              <div className="min-w-0 flex-[0_1_54%]">
                <button
                  type="button"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-dropdown"
                  onClick={toggleMobileMenu}
                  className="relative flex h-[47px] w-full items-center justify-between overflow-hidden rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] px-5 shadow-md transition-transform duration-200 active:scale-[0.99]"
                >
                  <span className="text-[15px] font-semibold uppercase tracking-wide text-[#e5d3a3]">
                    Meny
                  </span>

                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-black/55 text-[11px] font-bold leading-none text-[#e5d3a3] shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-transform duration-200",
                      isMobileMenuOpen ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  >
                    ▼
                  </span>
                </button>
              </div>

              {isLoggedIn ? (
                <div className="shrink-0">
                  <MemberButton profileImage={profileImageUrl} compact />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    performNavigation(
                      desktopNavItems[desktopNavItems.length - 1]
                    )
                  }
                  className="shrink-0 rounded-full bg-transparent transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/nav/loggaIn.png"
                    alt="Logga in"
                    draggable={false}
                    className="block h-[44px] w-auto object-contain"
                  />
                </button>
              )}
            </div>

            <div
              id="mobile-nav-dropdown"
              className={[
                "overflow-hidden transition-all duration-300 ease-out",
                isMobileMenuOpen
                  ? "mt-3 max-h-[640px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="rounded-[22px] border border-[#c7b28a] bg-[linear-gradient(180deg,rgba(255,248,235,0.94)_0%,rgba(234,222,200,0.92)_100%)] p-[8px] shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
                <div className="flex flex-col gap-[8px]">
                  {mobileMenuItems.map((item) => renderMobileMenuButton(item))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-3 sm:flex sm:gap-4 md:gap-5">
            {desktopNavItems.map((item) => {
              const isSectionActive =
                item.type === "section" &&
                active === item.id &&
                pathname === "/";

              const isRouteActive =
                item.type === "route" && item.href === pathname;

              const isActive = isSectionActive || isRouteActive;

              if (item.id === "account") {
                return isLoggedIn ? (
                  <div key={item.id} className="flex items-center">
                    <MemberButton profileImage={profileImageUrl} />
                  </div>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => performNavigation(item)}
                    className="rounded-full bg-transparent opacity-95 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]"
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      draggable={false}
                      className="block h-[34px] w-auto object-contain sm:h-[40px] md:h-[48px]"
                    />
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => performNavigation(item)}
                  className={[
                    "rounded-full bg-transparent transition-all duration-300",
                    "hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]",
                    isActive
                      ? "scale-105 drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]"
                      : "opacity-95",
                  ].join(" ")}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    draggable={false}
                    className="block h-[34px] w-auto object-contain sm:h-[40px] md:h-[48px]"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}