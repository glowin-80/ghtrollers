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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[170px] rounded-t-[30px] bg-[radial-gradient(circle_at_top_left,rgba(228,209,165,0.45),transparent_42%),linear-gradient(180deg,rgba(244,236,221,0.78)_0%,rgba(252,251,248,0)_100%)]" />

      <div className="pointer-events-none absolute left-6 right-6 top-[188px] h-px bg-gradient-to-r from-transparent via-[#d6c08a] to-transparent" />

      <div className="pointer-events-none absolute left-1/2 top-[181px] -translate-x-1/2 text-base text-[#c8a85c]">
        ✦
      </div>

      <div className="relative px-5 pb-4 pt-7 sm:px-6 sm:pt-8">
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
          </div>
        </div>

        <div className="pl-[108px] sm:pl-[126px]">
          <div className="text-[0.95rem] font-medium tracking-wide text-[#74685a]">
            👋 Min sida
          </div>

          <h1 className="mt-1 text-[1.95rem] font-bold leading-[0.94] text-[#1f2937] sm:text-[2.15rem]">
            {member.name}
          </h1>

          {member.email ? (
            <div className="mt-2 overflow-hidden text-ellipsis whitespace-nowrap border-b border-[#d8d2c7] pb-2 text-[0.95rem] text-[#5d6572]">
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

          <div className="mt-4 flex gap-3">
            <Link
              href="/"
              className="inline-flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-4 text-sm font-semibold text-[#374151] shadow-[0_4px_10px_rgba(0,0,0,0.04)] transition hover:bg-[#f9f7f3]"
            >
              Till startsidan
            </Link>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex h-[46px] min-w-0 flex-1 items-center justify-center rounded-full bg-[#324b2f] px-4 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(50,75,47,0.22)] transition hover:bg-[#3e5d3b]"
              >
                Logga ut
              </button>
            ) : null}
          </div>
        </div>

        {onProfileImageUploaded ? (
          <div className="mt-6 rounded-[24px] border border-[#e5ddd0] bg-white/82 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-sm">
            <div className="text-base font-semibold text-[#3f3a33]">
              Profilbild
            </div>

            <p className="mt-1 text-sm leading-6 text-[#6b7280]">
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