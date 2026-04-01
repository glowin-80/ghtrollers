export default function PendingApprovalCard() {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-6 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h1 className="text-3xl font-bold text-[#1f2937]">
        ⏳ Medlemskapet granskas
      </h1>

      <p className="mt-3 text-[#6b7280]">
        Ditt medlemskap är under granskning, så snart vi fiskat klart kikar vi
        på din ansökan.
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="/"
          className="inline-flex rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
        >
          Till startsidan
        </a>
      </div>
    </section>
  );
}
