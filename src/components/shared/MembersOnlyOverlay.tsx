import Link from "next/link";

type MembersOnlyOverlayProps = {
  title: string;
  description: string;
  loginHref?: string;
  hideLoginButton?: boolean;
};

export default function MembersOnlyOverlay({
  title,
  description,
  loginHref = "/login",
  hideLoginButton = false,
}: MembersOnlyOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-[#f6f1e8]/70 px-6 text-center backdrop-blur-[2px]">
      <div className="max-w-md rounded-[24px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.10)]">
        <div className="text-2xl font-bold text-[#1f2937]">{title}</div>
        <p className="mt-3 text-sm leading-6 text-[#5b6470]">{description}</p>

        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/" className="inline-flex rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]">Till startsidan</Link>
          {!hideLoginButton ? (
            <Link href={loginHref} className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]">Logga in</Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
