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
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#ccb98d] bg-gradient-to-br from-[#31492d] to-[#1f2b1d] shadow-[0_8px_20px_rgba(0,0,0,0.16)]">
              {member.profile_image_url ? (
                <img
                  src={member.profile_image_url}
                  alt="Profilbild"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl text-[#e5d3a3]">👤</span>
              )}
            </div>

            <div>
              <div className="text-sm font-medium text-[#6f6253]">👋 Min sida</div>
              <h1 className="mt-1 text-3xl font-bold text-[#1f2937]">
                {member.name}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#5b6470]">
                {member.email ? <span>{member.email}</span> : null}

                <span className="rounded-full bg-[#f2ede5] px-3 py-1 font-medium text-[#5c4d3f]">
                  {member.is_admin ? "Admin" : "Medlem"}
                </span>

                <span className="rounded-full bg-[#f2ede5] px-3 py-1 font-medium text-[#5c4d3f]">
                  {catchCount} fångster
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
            >
              Till startsidan
            </a>

            {onLogout ? (
              <button
                type="button"
                onClick={onLogout}
                className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
              >
                Logga ut
              </button>
            ) : null}
          </div>
        </div>

        {onProfileImageUploaded ? (
          <div className="rounded-[22px] border border-[#e7e0d4] bg-[#fbfaf7] p-4">
            <div className="mb-2 text-sm font-semibold text-[#3f3a33]">
              Profilbild
            </div>

            <p className="mb-3 text-sm text-[#6b7280]">
              Ladda upp en profilbild så visas den här och i knappen för Min sida.
            </p>

            <ProfileImageUploader
              memberEmail={member.email ?? null}
              currentImageUrl={member.profile_image_url ?? null}
              onUploaded={onProfileImageUploaded}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}