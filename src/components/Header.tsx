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

type SlotDirection = "prev" | "next" | null;
type SlotRole = "prev" | "current" | "next";

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

const SLOT_ANIMATION_MS = 240;
const SWIPE_THRESHOLD = 42;
const MAX_DRAG_OFFSET = 34;

function getWrappedIndex(index: number, length: number) {
  return (index + length) % length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const touchStartXRef = useRef<number | null>(null);
  const animationTimeoutRef = useRef<number | null>(null);

  const [active, setActive] = useState("leaderboard");
  const [slotIndex, setSlotIndex] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [slotDirection, setSlotDirection] = useState<SlotDirection>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);

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

      if (animationTimeoutRef.current !== null) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (pathname === "/galleri") {
      setActive("gallery");
      setSlotIndex(sectionItems.findIndex((item) => item.id === "gallery"));
      return;
    }

    if (pathname === "/") {
      const currentIndex = sectionItems.findIndex((item) => item.id === active);
      if (currentIndex >= 0) {
        setSlotIndex(currentIndex);
      }
    }
  }, [pathname, active]);

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

  const previousSlotItem =
    sectionItems[getWrappedIndex(slotIndex - 1, sectionItems.length)];
  const currentSlotItem = sectionItems[slotIndex];
  const nextSlotItem =
    sectionItems[getWrappedIndex(slotIndex + 1, sectionItems.length)];

  function scrollToSection(sectionId: string, itemId: string) {
    setActive(itemId);

    const nav = document.getElementById("site-nav");

    if (pathname !== "/") {
      router.push(`/#${sectionId}`);
      return;
    }

    const el = document.getElementById(sectionId);
    if (!el) return;

    const navHeight = nav ? nav.offsetHeight : 0;
    const elementTop = el.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementTop - navHeight - 20;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });
  }

  function handleClick(item: NavItem) {
    if (slotDirection) return;

    if (item.type === "section" && item.section) {
      scrollToSection(item.section, item.id);
      return;
    }

    if (item.type === "route" && item.href) {
      setActive(item.id);
      router.push(item.href);
      return;
    }

    if (item.type === "action") {
      router.push(isLoggedIn ? "/min-sida" : "/login");
    }
  }

  function cycleSlot(direction: "prev" | "next") {
    if (slotDirection) return;

    setDragOffsetX(0);
    setIsDragging(false);
    setSlotDirection(direction);

    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current);
    }

    animationTimeoutRef.current = window.setTimeout(() => {
      setSlotIndex((current) =>
        direction === "prev"
          ? getWrappedIndex(current - 1, sectionItems.length)
          : getWrappedIndex(current + 1, sectionItems.length)
      );
      setSlotDirection(null);
    }, SLOT_ANIMATION_MS);
  }

  function handleSlotTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (slotDirection) return;
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
    setIsDragging(true);
  }

  function handleSlotTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (touchStartXRef.current === null || slotDirection) return;

    const currentX = event.touches[0]?.clientX ?? touchStartXRef.current;
    const deltaX = currentX - touchStartXRef.current;

    setDragOffsetX(clamp(deltaX, -MAX_DRAG_OFFSET, MAX_DRAG_OFFSET));
  }

  function handleSlotTouchEnd() {
    if (slotDirection) return;

    const deltaX = dragOffsetX;

    touchStartXRef.current = null;
    setIsDragging(false);

    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      setDragOffsetX(0);

      if (deltaX > 0) {
        cycleSlot("prev");
        return;
      }

      cycleSlot("next");
      return;
    }

    setDragOffsetX(0);
  }

  function getSlideTranslatePercent(role: SlotRole) {
    const base = role === "prev" ? -64 : role === "next" ? 64 : 0;

    const animatedShift =
      slotDirection === "next" ? -64 : slotDirection === "prev" ? 64 : 0;

    return base + animatedShift;
  }

  function getAnimatedInnerStyle(role: SlotRole) {
    const translatePercent = getSlideTranslatePercent(role);
    const dragPixels = slotDirection ? 0 : dragOffsetX;

    return {
      transform: `translateX(calc(${translatePercent}% + ${dragPixels}px))`,
    };
  }

  function getOuterSlotClassName(role: SlotRole) {
    const zIndexClass = role === "current" ? "z-20" : "z-10";

    return [
      "absolute inset-y-0 left-1/2 w-[86%] -translate-x-1/2",
      "flex items-center justify-center",
      zIndexClass,
    ].join(" ");
  }

  function getAnimatedInnerClassName(role: SlotRole) {
    const scaleClass = role === "current" ? "scale-100" : "scale-[0.96]";
    const transitionClass = isDragging
      ? ""
      : "transition-transform duration-200 ease-out";

    const slotAnimationClass = slotDirection
      ? "transition-transform duration-[240ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
      : transitionClass;

    return [
      "flex h-[48px] w-full items-center justify-center",
      scaleClass,
      slotAnimationClass,
    ].join(" ");
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
          <div className="flex items-center justify-center gap-3 sm:hidden">
            <div
              className="relative h-[48px] min-w-0 max-w-[360px] flex-1 overflow-hidden rounded-full"
              onTouchStart={handleSlotTouchStart}
              onTouchMove={handleSlotTouchMove}
              onTouchEnd={handleSlotTouchEnd}
            >
              <div className="absolute inset-0 rounded-full bg-[#d8cfbf]" />

              <button
                type="button"
                aria-label={`Visa föregående: ${previousSlotItem.alt}`}
                onClick={() => cycleSlot("prev")}
                disabled={!!slotDirection}
                className="absolute inset-y-0 left-0 z-30 w-[26%]"
              >
                <span className="sr-only">Visa föregående</span>
              </button>

              <button
                type="button"
                aria-label={`Visa nästa: ${nextSlotItem.alt}`}
                onClick={() => cycleSlot("next")}
                disabled={!!slotDirection}
                className="absolute inset-y-0 right-0 z-30 w-[26%]"
              >
                <span className="sr-only">Visa nästa</span>
              </button>

              <button
                type="button"
                onClick={() => handleClick(previousSlotItem)}
                aria-label={`${previousSlotItem.alt} (föregående)`}
                className={getOuterSlotClassName("prev")}
                disabled={!!slotDirection}
                tabIndex={-1}
              >
                <div
                  className={getAnimatedInnerClassName("prev")}
                  style={getAnimatedInnerStyle("prev")}
                >
                  <img
                    src={previousSlotItem.src}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="pointer-events-none block h-[48px] w-auto max-w-none object-contain"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleClick(currentSlotItem)}
                aria-label={currentSlotItem.alt}
                className={getOuterSlotClassName("current")}
                disabled={!!slotDirection}
              >
                <div
                  className={getAnimatedInnerClassName("current")}
                  style={getAnimatedInnerStyle("current")}
                >
                  <img
                    src={currentSlotItem.src}
                    alt={currentSlotItem.alt}
                    draggable={false}
                    className="pointer-events-none block h-[48px] w-auto max-w-none object-contain"
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleClick(nextSlotItem)}
                aria-label={`${nextSlotItem.alt} (nästa)`}
                className={getOuterSlotClassName("next")}
                disabled={!!slotDirection}
                tabIndex={-1}
              >
                <div
                  className={getAnimatedInnerClassName("next")}
                  style={getAnimatedInnerStyle("next")}
                >
                  <img
                    src={nextSlotItem.src}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="pointer-events-none block h-[48px] w-auto max-w-none object-contain"
                  />
                </div>
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
                  className="block h-[48px] w-auto object-contain"
                />
              </button>
            )}
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