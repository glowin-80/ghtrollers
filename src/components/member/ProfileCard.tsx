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
    <section className="relative overflow-visible rounded-[28px] border border-[#d8d2c7] bg-white/95 px-5 pb-4 pt-8 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:px-6 sm:pt-9">
      <div className="absolute -left-3 -top-5 z-10 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#ccb98d] bg-gradient-to-br from-[#31492d] to-[#1f2b1d] shadow-[0_14px_28px_rgba(0,0,0,0.18)] sm:-left-4 sm:-top-6 sm:h-32 sm:w-32">
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

      <div className="pl-[108px] sm:pl-[122px]">
        <div className="text-xs font-medium tracking-wide text-[#6f6253]">
          👋 Min sida
        </div>

        <h1 className="mt-1 break-words text-[1.95rem] font-bold leading-[0.95] text-[#1f2937] sm:text-[2.2rem]">
          {member.name}
        </h1>

        {member.email ? (
          <div className="mt-2 break-all text-[0.95rem] text-[#5b6470] sm:text-[0.95rem]">
            {member.email}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-medium text-[#5c4d3f]">
            {member.is_admin ? "Admin" : "Medlem"}
          </span>

          <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-sm font-medium text-[#5c4d3f]">
            {catchCount} fångster
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[#d8d2c7] bg-white px-4 py-2.5 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Till startsidan
          </Link>

          {onLogout ? (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-full bg-[#324b2f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
            >
              Logga ut
            </button>
          ) : null}
        </div>
      </div>

      {onProfileImageUploaded ? (
        <div className="mt-5 rounded-[22px] border border-[#e7e0d4] bg-[#fbfaf7] px-4 py-3">
          <div className="text-sm font-semibold text-[#3f3a33]">Profilbild</div>

          <p className="mt-1 text-sm leading-6 text-[#6b7280]">
            Ladda upp en profilbild så visas den här och i knappen för Min sida.
          </p>

          <div className="mt-3">
            <ProfileImageUploader
              memberId={member.id}
              currentImageUrl={member.profile_image_url ?? null}
              onUploaded={onProfileImageUploaded}
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}