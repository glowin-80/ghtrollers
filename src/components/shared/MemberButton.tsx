"use client";

import { memo } from "react";
import Link from "next/link";

type MemberButtonProps = {
  profileImage?: string | null;
  compact?: boolean;
};

function MemberButtonComponent({
  profileImage,
  compact = false,
}: MemberButtonProps) {
  return (
    <Link href="/min-sida">
      <div
        className={[
          "flex cursor-pointer items-center rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] shadow-md transition hover:scale-[1.03]",
          compact ? "h-[47px] gap-2 px-8" : "gap-2 px-8 py-2",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-center overflow-hidden rounded-full border border-[#bfa76a] bg-[#1f2b1d]",
            compact ? "h-8 w-8" : "h-7 w-7",
          ].join(" ")}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profilbild"
              className="h-full w-full object-cover"
              decoding="async"
            />
          ) : (
            <span
              className={compact ? "text-base text-[#d6c28a]" : "text-sm text-[#d6c28a]"}
            >
              👤
            </span>
          )}
        </div>

        <span
          className={[
            "font-semibold tracking-wide text-[#e5d3a3]",
            compact ? "text-[13px]" : "text-sm",
          ].join(" ")}
        >
          MIN SIDA
        </span>
      </div>
    </Link>
  );
}

const MemberButton = memo(MemberButtonComponent);

export default MemberButton;