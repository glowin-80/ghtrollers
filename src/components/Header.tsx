"use client";

import MemberButton from "@/components/shared/MemberButton";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type NavItem = {
  id: string;
  src: string;
  section?: string;
  alt: string;
  type: "section" | "action";
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
    section: "approved-section",
    alt: "Galleri",
    type: "section",
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
  const [active, setActive] = useState("leaderboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

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
    if (item.type === "section" && item.section) {
      scrollToSection(item.section, item.id);
      return;
    }

    if (item.type === "action") {
      router.push(isLoggedIn ? "/min-sida" : "/login");
    }
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
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5">
            {navItems.map((item) => {
              const isActive =
                item.type === "section" && active === item.id && pathname === "/";

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
