type AdminToolsCardProps = {
  pendingCount: number;
};

export default function AdminToolsCard({
  pendingCount,
}: AdminToolsCardProps) {
  return (
    <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
      <h2 className="text-2xl font-bold text-[#1f2937]">🛠 Adminverktyg</h2>

      <div className="mt-4 rounded-2xl border border-[#ddd8cf] bg-[#fffdfb] p-4">
        <div className="text-sm text-[#6b7280]">
          Du är admin och kan hantera inkomna fångster.
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="/admin"
            className="inline-flex items-center rounded-full bg-[#324b2f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
          >
            Godkänn fångster ({pendingCount})
          </a>

          <a
            href="/"
            className="inline-flex items-center rounded-full border border-[#d8d2c7] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
          >
            Till startsidan
          </a>
        </div>
      </div>
    </section>
  );
}
