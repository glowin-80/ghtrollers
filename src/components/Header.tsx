"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";
import {
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
  ThemedNavButton,
} from "@/components/header/header-ui";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, profileImageUrl } = useAuthMember();

  const [activeSection, setActiveSection] = useState("leaderboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (
      pathname !== "/" &&
      pathname !== "/all-time-high" &&
      pathname !== "/galleri" &&
      pathname !== "/markera-fiskeplats" &&
      pathname !== "/karta" &&
      pathname !== "/achievements" &&
      pathname !== "/achievements/gaddhang" &&
      pathname !== "/min-sida"
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!menuRef.current) return;

      const target = event.target as Node | null;

      if (target && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
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

  const filteredMenuItems = useMemo(() => {
    if (isLoggedIn) return mobileMenuItems;

    return mobileMenuItems.filter(
      (item) => item.id !== "map" && item.id !== "markera-fiskeplats"
    );
  }, [isLoggedIn]);

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
      setIsMobileMenuOpen: setIsMenuOpen,
      setActiveSection,
    });
  }

  function renderMenuButton(item: NavItem) {
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

  return (
    <>
      <header className="relative w-full bg-black">
        <div className="relative h-[140px] w-full overflow-hidden sm:h-[190px] lg:h-[230px] xl:h-[250px] 2xl:h-[280px]">
          <img
            src="/header.png"
            alt="Gäddhäng Trollers"
            className="h-full w-full object-cover object-center"
            draggable={false}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent via-black/45 to-black" />
        </div>
      </header>

      <div
        id="site-nav"
        className="sticky top-0 z-50 -mt-5 rounded-t-[30px] border-b border-black/10 bg-[#e5dccd]/95 backdrop-blur-md sm:-mt-6 sm:rounded-t-[36px]"
      >
        <div className="mx-auto max-w-2xl px-3 py-3 sm:px-4">
          <div ref={menuRef} className="relative">
            <div className="grid grid-cols-2 gap-[10px]">
              <MobileTopButton
                label="Meny"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                showArrow
                isExpanded={isMenuOpen}
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
              id="site-nav-dropdown"
              className={[
                "overflow-hidden transition-all duration-300 ease-out",
                isMenuOpen
                  ? "mt-3 max-h-[560px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="rounded-[22px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[7px] shadow-[0_16px_34px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-[7px]">
                  {filteredMenuItems.map((item) => renderMenuButton(item))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}