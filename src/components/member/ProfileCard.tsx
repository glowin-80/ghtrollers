import Link from "next/link";
import type { MemberProfile } from "@/types/member-page";
import ProfileImageUploader from "@/components/member/ProfileImageUploader";
import { getAchievementTitle, getProfileRoleLabel } from "@/lib/ght-rules";

type ProfileCardProps = {
  member?: MemberProfile | null;
  catchCount: number;
  onLogout?: () => void;
  onProfileImageUploaded?: (imageUrl: string) => void;
};

export default function ProfileCard({
  member,
  catchCount,
  onLogout,
  onProfileImageUploaded,
}: ProfileCardProps) {
  if (!member) {
    return null;
  }

  const profileRoleLabel = getProfileRoleLabel(member);
  const achievementTitle = getAchievementTitle(catchCount);

  return (
    <section className="relative overflow-visible rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_12px_36px_rgba(18,35,28,0.08)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[170px] rounded-t-[30px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.45),transparent_42%),linear-gradient(180deg,rgba(244,236,221,0.78)_0%,rgba(252,251,248,0)_100%)]" />

      <div className="relative px-5 pb-4 pt-7 sm:px-6 sm:pt-8">
        <div className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
          <div className="inline-flex items-center rounded-full border border-[#cab98f] bg-[#fffaf0] px-3 py-1 text-[0.82rem] font-semibold tracking-[0.01em] text-[#6c5b3d] shadow-[0_6px_14px_rgba(0,0,0,0.06)] sm:px-3.5 sm:text-[0.88rem]">
            {profileRoleLabel}
          </div>
        </div>

        <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
          <div className="relative">
            <div className="absolute inset-0 scale-110 rounded-full bg-[#e5d3a3]/35 blur-xl" />

            <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-[4px] border-[#d6bf83] bg-gradient-to-br from-[#31492d] to-[#1f2b1d] shadow-[0_16px_30px_rgba(0,0,0,0.16)] sm:h-28 sm:w-28">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt="Profilbild"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-4xl text-[#e5d3a3]">👤</span>
              )}
            </div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#d8d2c7] bg-[#f2ede5] px-3 py-1 text-xs font-semibold text-[#5c4d3f] shadow-[0_6px_14px_rgba(0,0,0,0.08)]">
              {catchCount} fångster
            </div>
          </div>
        </div>

        <div className="pl-[108px] pr-[92px] sm:pl-[126px] sm:pr-[120px]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[0.95rem] font-medium tracking-wide text-[#74685a]">
                👋 Min sida
              </div>

              <h1 className="mt-1 text-[1.95rem] font-bold leading-[0.94] text-[#1f2937] sm:text-[2.15rem]">
                {member.name}
              </h1>

              <div className="mt-2 text-[1rem] font-semibold tracking-[0.01em] text-[#6a5844] sm:text-[1.02rem]">
                {achievementTitle}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="pointer-events-none relative">
            <div className="h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fcfbf8] px-3 text-base text-[#c8a85c]">
              ✦
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="grid w-full max-w-[420px] grid-cols-2 gap-3">
            <Link
              href="/"
              className="inline-flex h-[48px] items-center justify-center whitespace-nowrap rounded-full bg-[#324b2f] px-5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(50,75,47,0.22)] transition hover:bg-[#3e5d3b]"
            >
              Till startsidan
            </Link>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-[48px] items-center justify-center whitespace-nowrap rounded-full border border-[#d8d2c7] bg-white px-5 text-sm font-semibold text-[#374151] shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#f9f7f3]"
              >
                Logga ut
              </button>
            ) : null}
          </div>
        </div>

        {onProfileImageUploaded ? (
          <div className="mt-7 rounded-[24px] border border-[#e5ddd0] bg-white/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
            <div className="text-base font-semibold text-[#3f3a33]">
              Profilbild
            </div>

            <p className="mt-2 text-sm leading-6 text-[#6b7280]">
              Ladda upp en profilbild så visas den här och i knappen för Min sida.
            </p>

            <div className="mt-4">
              <ProfileImageUploader
                memberId={member.id}
                currentImageUrl={member.profile_image_url ?? null}
                onUploaded={onProfileImageUploaded}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}