"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";
import { desktopGraphicItems, getMobileCardTheme, mobileMenuItems, type NavItem } from "@/components/header/header-config";
import { getPathActiveItem, performNavigation, scrollToSection } from "@/components/header/header-navigation";
import { MobileTopButton, SmallMenuBubble } from "@/components/header/header-ui";

function getDesktopNavImage(itemId: string) {
  const srcMap: Record<string, string> = {
    leaderboard: "/nav/leaderboard.png",
    upload: "/nav/laddaUpp.png",
    gallery: "/nav/galleri.png",
    map: "/nav/karta.png",
  };

  return srcMap[itemId] || "";
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const { isLoggedIn, profileImageUrl } = useAuthMember();

  const [activeSection, setActiveSection] = useState("leaderboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname !== "/" && pathname !== "/all-time-high" && pathname !== "/galleri" && pathname !== "/markera-fiskeplats") {
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
    return desktopGraphicItems.filter((item) => item.id !== "map" && item.id !== "markera-fiskeplats");
  }, [isLoggedIn]);

  const filteredMobileItems = useMemo(() => {
    if (isLoggedIn) return mobileMenuItems;
    return mobileMenuItems.filter((item) => item.id !== "map" && item.id !== "markera-fiskeplats");
  }, [isLoggedIn]);

  const desktopNavItems = useMemo<NavItem[]>(() => [
    ...filteredDesktopItems,
    {
      id: "account",
      label: isLoggedIn ? "Min sida" : "Logga in",
      alt: isLoggedIn ? "Min sida" : "Logga in",
      type: "action",
    },
  ], [filteredDesktopItems, isLoggedIn]);

  const currentActive = useMemo(() => getPathActiveItem(pathname) ?? activeSection, [activeSection, pathname]);

  function handleNavigation(item: NavItem) {
    performNavigation({ item, isLoggedIn, pathname, router, setIsMobileMenuOpen, setActiveSection });
  }

  function renderMobileMenuButton(item: NavItem) {
    const theme = getMobileCardTheme(item.id);
    const isCurrentRoute = item.type === "route" && ((item.href === "/" && pathname === "/") || item.href === pathname);
    const isCurrentSection = pathname === "/" && item.type === "section" && currentActive === item.id;
    const isActive = isCurrentRoute || isCurrentSection;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavigation(item)}
        className={[
          "group relative mx-auto flex w-full max-w-[calc(100%-36px)] items-center overflow-visible rounded-full border pr-[12px] pl-[54px] py-[4px] text-left shadow-[0_7px_16px_rgba(0,0,0,0.13)] transition-all duration-200",
          "min-h-[42px] active:scale-[0.99]",
          isActive ? "scale-[1.01]" : "hover:scale-[1.01]",
          theme.outer,
        ].join(" ")}
      >
        <div className="pointer-events-none absolute inset-[1px] rounded-full border border-white/10" />
        <SmallMenuBubble className={theme.iconCircle} />
        <div className="min-w-0 flex-1 pr-[2px]"><div className="truncate text-[13px] font-semibold leading-[1.05] tracking-[0.01em]">{item.label}</div></div>
        <div className={["flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-[1px]", theme.arrow].join(" ")} aria-hidden="true"><span className="text-[17px] leading-none">›</span></div>
      </button>
    );
  }

  return (
    <>
      <header className="w-full">
        <div className="relative h-[140px] w-full overflow-hidden sm:h-[320px] md:h-[380px]">
          <img src="/header.png" alt="Gäddhäng Trollers" className="h-full w-full object-cover object-[center_35%]" draggable={false} />
        </div>
      </header>

      <div id="site-nav" className="sticky top-0 z-50 border-b border-black/10 bg-[#e5dccd]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
          <div ref={mobileMenuRef} className="relative sm:hidden">
            <div className="grid grid-cols-2 gap-[10px]">
              <MobileTopButton label="Meny" onClick={() => setIsMobileMenuOpen((prev) => !prev)} showArrow isExpanded={isMobileMenuOpen} />
              <MobileTopButton
                label={isLoggedIn ? "Min sida" : "Logga in"}
                onClick={() => handleNavigation({ id: "account", label: isLoggedIn ? "Min sida" : "Logga in", alt: isLoggedIn ? "Min sida" : "Logga in", type: "action" })}
                imageUrl={isLoggedIn ? profileImageUrl : null}
              />
            </div>
            <div id="mobile-nav-dropdown" className={["overflow-hidden transition-all duration-300 ease-out", isMobileMenuOpen ? "mt-3 max-h-[520px] opacity-100" : "mt-0 max-h-0 opacity-0"].join(" ")}>
              <div className="rounded-[22px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[7px] shadow-[0_16px_34px_rgba(0,0,0,0.16)]">
                <div className="flex flex-col gap-[7px]">{filteredMobileItems.map((item) => renderMobileMenuButton(item))}</div>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-3 sm:flex sm:gap-4 md:gap-5">
            {desktopNavItems.map((item) => {
              const isSectionActive = item.type === "section" && currentActive === item.id && pathname === "/";
              const isRouteActive = item.type === "route" && item.href === pathname;
              const isActive = isSectionActive || isRouteActive;

              if (item.id === "account") {
                return isLoggedIn ? (
                  <button key={item.id} type="button" onClick={() => handleNavigation(item)} className="rounded-full bg-transparent transition-all duration-300 hover:scale-105">
                    <img src="/nav/minSida.png" alt="Min sida" draggable={false} className="block h-[34px] w-auto object-contain sm:h-[40px] md:h-[48px]" />
                  </button>
                ) : (
                  <button key={item.id} type="button" onClick={() => handleNavigation(item)} className="rounded-full bg-transparent opacity-95 transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]">
                    <img src="/nav/loggaIn.png" alt="Logga in" draggable={false} className="block h-[34px] w-auto object-contain sm:h-[40px] md:h-[48px]" />
                  </button>
                );
              }

              if (item.id === "markera-fiskeplats") {
                return (
                  <button key={item.id} type="button" onClick={() => handleNavigation(item)} className={[
                    "inline-flex h-[34px] items-center rounded-full border border-[#c3a766] bg-[linear-gradient(180deg,#5f6f8f_0%,#42526f_100%)] px-4 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#f3e5c1] transition-all duration-300 sm:h-[40px] md:h-[48px] md:px-5 md:text-[13px]",
                    "hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]",
                    isActive ? "scale-105 drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]" : "opacity-95",
                  ].join(" ")}>Markera fiskeplats</button>
                );
              }

              return (
                <button key={item.id} type="button" onClick={() => handleNavigation(item)} className={[
                  "rounded-full bg-transparent transition-all duration-300",
                  "hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]",
                  isActive ? "scale-105 drop-shadow-[0_8px_18px_rgba(0,0,0,0.20)]" : "opacity-95",
                ].join(" ")}>
                  <img src={getDesktopNavImage(item.id)} alt={item.alt} draggable={false} className="block h-[34px] w-auto object-contain sm:h-[40px] md:h-[48px]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
