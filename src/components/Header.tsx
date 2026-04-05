"use client";

import MemberButton from "@/components/shared/MemberButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";

type NavItem = {
  id: string;
  src?: string;
  label: string;
  section?: string;
  href?: string;
  alt: string;
  type: "section" | "route" | "action";
};

const graphicNavItems: NavItem[] = [
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
    id: "approved",
    label: "Nya godkända fångster",
    section: "approved-section",
    alt: "Nya godkända fångster",
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
    if (attempt < 12) {
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
      ...graphicNavItems,
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
      router.push(targetPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      navigateToHref(isLoggedIn ? "/min-sida" : "/login");
    }
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
  }

  function renderMobileMenuButton(item: NavItem) {
    if (item.src) {
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => performNavigation(item)}
          className="block w-[90%] rounded-full bg-transparent opacity-95 transition-all duration-200 hover:scale-[1.01]"
        >
          <img
            src={item.src}
            alt={item.alt}
            draggable={false}
            className="block h-[40px] w-full object-contain object-left"
          />
        </button>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => performNavigation(item)}
        className="flex w-[90%] items-center justify-between rounded-full border border-[#cfc4ae] bg-[#f8f4ea] px-4 py-3 text-left text-[#3f352b] shadow-[0_4px_10px_rgba(0,0,0,0.06)] transition-all duration-200 hover:scale-[1.01]"
      >
        <span className="text-[0.95rem] font-semibold leading-none">
          {item.label}
        </span>
        <span
          aria-hidden="true"
          className="text-[0.95rem] font-semibold text-[#8b7355]"
        >
          →
        </span>
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
                  className="relative flex h-[44px] w-full items-center justify-between rounded-full border border-[#9d6f2f] bg-gradient-to-b from-[#b87526] to-[#8a561f] px-5 shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition-transform duration-200 active:scale-[0.99]"
                >
                  <span className="text-[15px] font-bold uppercase tracking-[0.16em] text-[#f7ead0]">
                    Meny
                  </span>

                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none flex h-5 w-5 items-center justify-center rounded-full bg-black/65 text-[11px] font-bold leading-none text-[#f3e4bc] shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-transform duration-200",
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
                  ? "mt-2 max-h-[520px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="space-y-2 pb-1">
                {mobileMenuItems.map((item) => renderMobileMenuButton(item))}
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
                      src="/nav/loggaIn.png"
                      alt="Logga in"
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