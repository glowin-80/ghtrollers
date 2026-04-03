"use client";

import MemberButton from "@/components/shared/MemberButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthMember } from "@/hooks/useAuthMember";

type NavItem = {
  id: string;
  src: string;
  section?: string;
  href?: string;
  alt: string;
  type: "section" | "route" | "action";
};

const sectionItems: NavItem[] = [
  {
    id: "leaderboard",
    src: "/nav/leaderboard.png",
    section: "leaderboard-section",
    alt: "Leaderboard",
    type: "section",
  },
  {
    id: "upload",
    src: "/nav/laddaUpp.png",
    section: "upload-section",
    alt: "Ladda upp fångst",
    type: "section",
  },
  {
    id: "gallery",
    src: "/nav/galleri.png",
    href: "/galleri",
    alt: "Galleri",
    type: "route",
  },
  {
    id: "map",
    src: "/nav/karta.png",
    section: "map-section",
    alt: "Karta",
    type: "section",
  },
];

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

  const navItems = useMemo<NavItem[]>(() => {
    return [
      ...sectionItems,
      {
        id: "account",
        src: "/nav/loggaIn.png",
        alt: isLoggedIn ? "Min sida" : "Logga in",
        type: "action",
      },
    ];
  }, [isLoggedIn]);

  const activeMobileItem =
    sectionItems.find((item) => item.id === active) ?? sectionItems[0];

  const mobileDropdownItems = sectionItems.filter(
    (item) => item.id !== activeMobileItem.id
  );

  function performNavigation(item: NavItem) {
    if (item.type === "section" && item.section) {
      setActive(item.id);
      setIsMobileMenuOpen(false);

      const nav = document.getElementById("site-nav");

      if (pathname !== "/") {
        router.push(`/#${item.section}`);
        return;
      }

      const el = document.getElementById(item.section);
      if (!el) return;

      const navHeight = nav ? nav.offsetHeight : 0;
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      const targetPosition = elementTop - navHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
      return;
    }

    if (item.type === "route" && item.href) {
      setActive(item.id);
      setIsMobileMenuOpen(false);
      router.push(item.href);
      return;
    }

    if (item.type === "action") {
      setIsMobileMenuOpen(false);
      router.push(isLoggedIn ? "/min-sida" : "/login");
    }
  }

  function handleClick(item: NavItem) {
    performNavigation(item);
  }

  function toggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
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
          <div ref={mobileMenuRef} className="sm:hidden">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-nav-dropdown"
                className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] px-4 py-2.5 text-left shadow-md transition hover:scale-[1.01]"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-[0.08em] text-[#e5d3a3]">
                  {activeMobileItem.alt}
                </span>

                <span
                  className={[
                    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#bfa76a]/60 bg-[#243320] text-[#e5d3a3] transition-transform duration-300",
                    isMobileMenuOpen ? "rotate-180" : "rotate-0",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-4 w-4"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 7.5L10 12.5L15 7.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isLoggedIn ? (
                <MemberButton profileImage={profileImageUrl} compact />
              ) : (
                <button
                  type="button"
                  onClick={() => handleClick(navItems[navItems.length - 1])}
                  className="shrink-0 rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] px-4 py-[13px] text-sm font-semibold uppercase tracking-[0.08em] text-[#e5d3a3] shadow-md transition hover:scale-[1.01]"
                >
                  Logga in
                </button>
              )}
            </div>

            <div
              id="mobile-nav-dropdown"
              className={[
                "overflow-hidden transition-all duration-300 ease-out",
                isMobileMenuOpen
                  ? "mt-2 max-h-[260px] opacity-100"
                  : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="space-y-2 pb-1">
                {mobileDropdownItems.map((item) => {
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleClick(item)}
                      className="flex w-full items-center justify-center rounded-[24px] border border-[#d6c8af] bg-[#f6f0e4] px-4 py-2.5 text-center text-[0.92rem] font-semibold text-[#2f3b2a] shadow-sm transition hover:bg-[#efe6d5]"
                    >
                      {item.alt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <nav className="hidden sm:flex sm:items-center sm:justify-center sm:gap-3">
            {navItems.map((item) => {
              if (item.id === "account" && isLoggedIn) {
                return <MemberButton key={item.id} profileImage={profileImageUrl} />;
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleClick(item)}
                  className={[
                    "group relative overflow-hidden rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] px-3 py-2 shadow-md transition hover:scale-[1.03]",
                    active === item.id ? "ring-2 ring-[#d6c28a]" : "",
                  ].join(" ")}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-9 w-auto object-contain"
                    draggable={false}
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
