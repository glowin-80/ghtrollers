"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";
import {
  desktopGraphicItems,
  getMobileCardTheme,
  mobileMenuItems,
  type NavItem,
} from "@/components/header/header-config";
import {
  getPathActiveItem,
  performNavigation,
  scrollToSection,
} from "@/components/header/header-navigation";
import {
  MobileTopButton,
  SmallMenuBubble,
  ThemedNavButton,
} from "@/components/header/header-ui";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, profileImageUrl } = useAuthMember();

  const [activeSection, setActiveSection] = useState("leaderboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (
      pathname !== "/" &&
      pathname !== "/all-time-high" &&
      pathname !== "/galleri" &&
      pathname !== "/markera-fiskeplats"
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
    if (typeof window === "undefined" || pathname !== "/") return;
    const hash = window.location.hash;
    if (!hash) return;
    const sectionId = hash.replace(/^#/, "");
    const timer = window.setTimeout(() => {
      scrollToSection(sectionId);
    }, 60);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const filteredDesktopItems = useMemo(() => {
    if (isLoggedIn) return desktopGraphicItems;
    return desktopGraphicItems.filter(
      (item) => item.id !== "map" && item.id !== "markera-fiskeplats"
    );
  }, [isLoggedIn]);

  const filteredMobileItems = useMemo(() => {
    if (isLoggedIn) return mobileMenuItems;
    return mobileMenuItems.filter(
      (item) => item.id !== "map" && item.id !== "markera-fiskeplats"
    );
  }, [isLoggedIn]);

  const desktopNavItems = useMemo<NavItem[]>(
    () => [
      ...filteredDesktopItems,
      {
        id: "account",
        label: isLoggedIn ? "Min sida" : "Logga in",
        alt: isLoggedIn ? "Min sida" : "Logga in",
        type: "action",
      },
    ],
    [filteredDesktopItems, isLoggedIn]
  );

  const currentActive = useMemo(
    () => getPathActiveItem(pathname) ?? activeSection,
    [activeSection, pathname]
  );

  function handleNavigation(item: NavItem) {
    performNavigation({
      item,
      isLoggedIn,
      pathname,
      router,
      setIsMobileMenuOpen,
      setActiveSection,
    });
  }

  function renderMobileMenuButton(item: NavItem) {
    const theme = getMobileCardTheme(item.id);
    const isCurrentRoute =
      item.type === "route" &&
      ((item.href === "/" && pathname === "/") || item.href === pathname);
    const isCurrentSection =
      pathname === "/" && item.type === "section" && currentActive === item.id;
    const isActive = isCurrentRoute || isCurrentSection;

    return (
      <ThemedNavButton
        key={item.id}
        label={item.label ?? item.alt}
        onClick={() => handleNavigation(item)}
        themeOuter={theme.outer}
        themeIconCircle={theme.iconCircle}
        themeArrow={theme.arrow}
        isActive={isActive}
        compact
      />
    );
  }

  function renderDesktopMenuButton(item: NavItem) {
    const theme = getMobileCardTheme(item.id);
    const isSectionActive =
      item.type === "section" && currentActive === item.id && pathname === "/";
    const isRouteActive =
      item.type === "route" &&
      ((item.href === "/" && pathname === "/") || item.href === pathname);
    const isActive = isSectionActive || isRouteActive;

    return (
      <div key={item.id} className="min-w-[220px] max-w-[260px] flex-1">
        <ThemedNavButton
          label={item.label ?? item.alt}
          onClick={() => handleNavigation(item)}
          themeOuter={theme.outer}
          themeIconCircle={theme.iconCircle}
          themeArrow={theme.arrow}
          isActive={isActive}
        />
      </div>
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
            <div className="grid grid-cols-2 gap-[10px]">
              <MobileTopButton
                label="Meny"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                showArrow
                isExpanded={isMobileMenuOpen}
              />
              <MobileTopButton
                label={isLoggedIn ? "Min sida" : "Logga in"}
                onClick={() =>
                  handleNavigation({
                    id: "account",
                    label: isLoggedIn ? "Min sida" : "Logga in",
                    alt: isLoggedIn ? "Min sida" : "Logga in",
                    type: "action",
                  })
                }
                imageUrl={isLoggedIn ? profileImageUrl : null}
              />
            </div>

            <div
              id="mobile-nav-dropdown"
              className={[
                "overflow-hidden transition-all duration-300 ease-out",
                isMobileMenuOpen
                  ? "mt-3 max-h-[520px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="rounded-[22px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[7px] shadow-[0_16px_34px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-[7px]">
                  {filteredMobileItems.map((item) => renderMobileMenuButton(item))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="rounded-[26px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[10px] shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
              <div className="flex flex-wrap items-stretch justify-center gap-[10px]">
                {desktopNavItems.map((item) => {
                  if (item.id === "account") {
                    return (
                      <div key={item.id} className="min-w-[220px] max-w-[260px] flex-1">
                        <button
                          type="button"
                          onClick={() => handleNavigation(item)}
                          className="relative flex min-h-[52px] w-full items-center overflow-visible rounded-full border border-[#bfa76a] bg-[linear-gradient(180deg,#2b4c20_0%,#183417_100%)] pr-[14px] pl-[64px] text-left shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:scale-[1.02] active:scale-[0.99]"
                        >
                          <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/10" />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2">
                            {isLoggedIn ? (
                              <div className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#d2b77a] bg-[#29441f] shadow-[0_2px_7px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]">
                                {profileImageUrl ? (
                                  <img
                                    src={profileImageUrl}
                                    alt="Min sida"
                                    draggable={false}
                                    className="h-[46px] w-[46px] rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#6c8655_0%,#466233_100%)] text-[#f3ddb0]">
                                    <span className="text-[24px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.20)]">
                                      ★
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <SmallMenuBubble className="bg-[linear-gradient(180deg,#6c8655_0%,#466233_100%)] text-[#f3ddb0]" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pr-[4px]">
                            <div className="truncate text-[14px] font-semibold uppercase tracking-[0.04em] text-[#ead8ab]">
                              {isLoggedIn ? "Min sida" : "Logga in"}
                            </div>
                          </div>

                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#ead8ab]"
                            aria-hidden="true"
                          >
                            <span className="text-[18px] leading-none">›</span>
                          </div>
                        </button>
                      </div>
                    );
                  }

                  return renderDesktopMenuButton(item);
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}