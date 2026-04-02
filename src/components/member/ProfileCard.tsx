import Link from "next/link";
import type { MemberProfile } from "@/types/member-page";
import ProfileImageUploader from "@/components/member/ProfileImageUploader";

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

  return (
    <section className="relative overflow-visible rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_12px_36px_rgba(18,35,28,0.08)]">
      <div className="absolute inset-x-0 top-0 h-[210px] rounded-t-[30px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.55),transparent_40%),linear-gradient(180deg,rgba(244,236,221,0.85)_0%,rgba(252,251,248,0)_100%)] pointer-events-none" />

      <div className="pointer-events-none absolute left-6 right-6 top-[210px] h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-[203px] -translate-x-1/2 text-[#c8a85c] text-lg">
        ✦
      </div>

      <div className="relative px-5 pb-4 pt-10 sm:px-6 sm:pt-11">
        <div className="absolute -left-3 -top-8 z-10 sm:-left-4 sm:-top-9">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#e5d3a3]/40 blur-xl scale-110" />

            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-[4px] border-[#d6bf83] bg-gradient-to-br from-[#31492d] to-[#1f2b1d] shadow-[0_18px_36px_rgba(0,0,0,0.18)] sm:h-36 sm:w-36">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt="Profilbild"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-5xl text-[#e5d3a3]">👤</span>
              )}
            </div>
          </div>
        </div>

        <div className="pl-[120px] sm:pl-[142px]">
          <div className="text-[0.95rem] font-medium tracking-wide text-[#74685a]">
            👋 Min sida
          </div>

          <h1 className="mt-1 break-words text-[2rem] font-bold leading-[0.92] text-[#1f2937] sm:text-[2.25rem]">
            {member.name}
          </h1>

          {member.email ? (
            <div className="mt-3 break-all border-b border-[#d8d2c7] pb-2 text-[0.95rem] text-[#5d6572] sm:text-base">
              {member.email}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-medium text-[#5c4d3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              {member.is_admin ? "Admin" : "Medlem"}
            </span>

            <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-medium text-[#5c4d3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              {catchCount} fångster
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-[50px] items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-5 py-2.5 text-sm font-semibold text-[#374151] shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#f9f7f3]"
            >
              Till startsidan
            </Link>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex min-h-[50px] items-center justify-center rounded-full bg-[#324b2f] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(50,75,47,0.22)] transition hover:bg-[#3e5d3b]"
              >
                Logga ut
              </button>
            ) : null}
          </div>
        </div>

        {onProfileImageUploaded ? (
          <div className="mt-7 rounded-[24px] border border-[#e5ddd0] bg-white/78 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-[520px]">
                <div className="text-base font-semibold text-[#3f3a33]">
                  Profilbild
                </div>

                <p className="mt-1 text-sm leading-6 text-[#6b7280]">
                  Ladda upp en profilbild så visas den här och i knappen för Min sida.
                </p>
              </div>
            </div>

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
