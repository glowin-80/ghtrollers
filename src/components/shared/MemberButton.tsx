"use client";

import Link from "next/link";

type MemberButtonProps = {
  profileImage?: string | null;
};

export default function MemberButton({ profileImage }: MemberButtonProps) {
  return (
    <Link href="/min-sida">
      <div className="flex cursor-pointer items-center gap-2 rounded-full border border-[#bfa76a] bg-gradient-to-b from-[#2e3f2b] to-[#1f2b1d] px-4 py-2 shadow-md transition hover:scale-[1.03]">
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[#bfa76a] bg-[#1f2b1d]">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profilbild"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-[#d6c28a]">👤</span>
          )}
        </div>

        <span className="text-sm font-semibold tracking-wide text-[#e5d3a3]">
          MIN SIDA
        </span>
      </div>
    </Link>
  );
}
