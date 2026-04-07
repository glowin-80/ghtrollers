import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SFVOF",
  description: "Isolerad SFVOF-del för gösregistrering",
};

export default function SfvofLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="border-b border-[#d7dfdc] bg-[linear-gradient(180deg,#f8fbfa_0%,#eef4f2_100%)]">
        <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#5c6f69]">
            Placeholder
          </div>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[1.8rem] font-bold leading-none text-[#1f2f2a] sm:text-[2.1rem]">
                Storsjöns FVOF
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#58706a]">
                Isolerad arbetsyta för registrering av gösmätningar. Ingen meny eller
                branding från Gäddhäng Trollers visas här.
              </p>
            </div>
            <div className="rounded-full border border-[#cdd8d4] bg-white px-3 py-1.5 text-[0.78rem] font-semibold text-[#46615a] shadow-[0_4px_10px_rgba(0,0,0,0.04)]">
              SFVOF basläge
            </div>
          </div>
        </div>
      </header>

      {children}
    </>
  );
}
