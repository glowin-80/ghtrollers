"use client";

import MemberButton from "@/components/shared/MemberButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  const [active, setActive] = useState("leaderboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadSessionAndProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setIsLoggedIn(!!session);

      if (!session?.user?.email) {
        setProfileImage(null);
        return;
      }

      const { data: memberData, error } = await supabase
        .from("members")
        .select("profile_image_url")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error) {
        console.error(error);
        setProfileImage(null);
        return;
      }

      setProfileImage(memberData?.profile_image_url || null);
    }

    loadSessionAndProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoggedIn(!!session);

      if (!session?.user?.email) {
        setProfileImage(null);
        return;
      }

      const { data: memberData, error } = await supabase
        .from("members")
        .select("profile_image_url")
        .eq("email", session.user.email)
        .maybeSingle();

      if (error) {
        console.error(error);
        setProfileImage(null);
        return;
      }

      setProfileImage(memberData?.profile_image_url || null);
    });

    function handleProfileImageUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ imageUrl?: string }>;
      const imageUrl = customEvent.detail?.imageUrl || null;
      setProfileImage(imageUrl);
    }

    window.addEventListener("profile-image-updated", handleProfileImageUpdated);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(
        "profile-image-updated",
        handleProfileImageUpdated
      );
    };
  }, []);

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
          <div ref={mobileMenuRef} className="relative sm:hidden">
            <div className="flex items-center gap-[6px]">
              <div className="min-w-0 flex-[0_1_54%]">
                <button
                  type="button"
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-dropdown"
                  onClick={toggleMobileMenu}
                  className="relative block w-full rounded-full bg-transparent transition-transform duration-200 active:scale-[0.99]"
                >
                  <img
                    src={activeMobileItem.src}
                    alt={activeMobileItem.alt}
                    draggable={false}
                    className="block h-[44px] w-full object-contain object-left"
                  />

                  <span
                    aria-hidden="true"
                    className={[
                      "pointer-events-none absolute right-[30px] top-[80%] z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-[11px] font-bold leading-none text-[#f3e4bc] shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-transform duration-200",
                      isMobileMenuOpen ? "rotate-180" : "rotate-0",
                    ].join(" ")}
                  >
                    ▼
                  </span>
                </button>
              </div>

              {isLoggedIn ? (
                <div className="shrink-0">
                  <MemberButton profileImage={profileImage} compact />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleClick(navItems[navItems.length - 1])}
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
                })}
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-center gap-3 sm:flex sm:gap-4 md:gap-5">
            {navItems.map((item) => {
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
                    <MemberButton profileImage={profileImage} />
                  </div>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleClick(item)}
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
                  onClick={() => handleClick(item)}
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