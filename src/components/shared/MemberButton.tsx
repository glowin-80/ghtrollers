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
          "flex cursor-pointer items-center overflow-hidden rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] shadow-md transition hover:scale-[1.03]",
          compact ? "h-[47px] pl-[2px] pr-6" : "h-[52px] pl-[3px] pr-8",
        ].join(" ")}
      >
        <div
          className={[
            "shrink-0 overflow-hidden rounded-full bg-[#1f2b1d]",
            compact ? "h-[43px] w-[43px]" : "h-[46px] w-[46px]",
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
            <div className="flex h-full w-full items-center justify-center text-[#d6c28a]">
              <span className={compact ? "text-lg" : "text-xl"}>👤</span>
            </div>
          )}
        </div>

        <span
          className={[
            "ml-3 font-semibold tracking-wide text-[#e5d3a3]",
            compact ? "text-[15px]" : "text-sm",
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