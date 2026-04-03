"use client";

import { useMemo, useState } from "react";
import { useHomeData } from "@/hooks/useHomeData";
import type { Catch } from "@/types/home";

function getCatchLabel(item: Catch) {
  if (item.fish_type === "Fina fisken" && item.fine_fish_type) {
    return `Fina fisken (${item.fine_fish_type})`;
  }

  return item.fish_type;
}

function formatWeight(weightG: number) {
  if (weightG >= 1000) {
    return `${(weightG / 1000).toFixed(2)} kg`;
  }

  return `${weightG} g`;
}

function formatDate(dateString: string) {
  if (!dateString) {
    return "-";
  }

  return new Intl.DateTimeFormat("sv-SE").format(new Date(dateString));
}

export default function GalleriPage() {
  const { approvedCatches } = useHomeData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const currentSwedenYear = useMemo(() => {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    }).format(new Date());
  }, []);

  const availableYears = useMemo(() => {
    const startYear = 2016;
    const endYear = Number(currentSwedenYear);
    const years: string[] = [];

    for (let year = endYear; year >= startYear; year -= 1) {
      years.push(String(year));
    }

    return years;
  }, [currentSwedenYear]);

  const [selectedYear, setSelectedYear] = useState(currentSwedenYear);

  const filteredCatches = useMemo(() => {
    return approvedCatches.filter((item) =>
      item.catch_date?.startsWith(selectedYear)
    );
  }, [approvedCatches, selectedYear]);

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-4 shadow-[0_8px_24px_rgba(18,35,28,0.06)] sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-[1.95rem] font-bold leading-none text-[#1f2937] sm:text-[2.15rem]">
                Galleri
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-[#67747d]">
                Här hittar du alla godkända fångster för valt år. Välj år och bläddra genom bilderna i lugn och ro.
              </p>
            </div>

            <div className="relative shrink-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="rounded-full border border-[#d8d2c7] bg-[#f7f4ee] px-4 py-2 pr-10 text-sm font-semibold text-[#4b5563] outline-none transition hover:bg-[#f1ece3] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
                aria-label="Välj år för galleri"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6b7280]">
                ▼
              </span>
            </div>
          </div>

          <div className="mt-4">
            <span className="rounded-full bg-[#f2ede5] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#5c4d3f]">
              {selectedYear}
            </span>
          </div>

          {filteredCatches.length === 0 ? (
            <div className="mt-5 rounded-[24px] border border-dashed border-[#d8d2c7] bg-[#faf8f4] px-4 py-8 text-sm text-[#6b7280]">
              Inga godkända fångster finns i galleriet för {selectedYear}.
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredCatches.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[22px] border border-[#d8d2c7] bg-[#fffdf9] shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => item.image_url && setSelectedImage(item.image_url)}
                    className="block w-full bg-[#ebe7de] text-left"
                    aria-label={`Öppna bild för ${item.caught_for}`}
                  >
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={`${item.caught_for} fångst`}
                        className="h-40 w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-40 w-full items-center justify-center text-sm font-semibold text-[#6b7280]">
                        Ingen bild
                      </div>
                    )}
                  </button>

                  <div className="space-y-1 px-3 py-3">
                    <div className="truncate text-sm font-bold text-[#1f2937]">
                      {item.caught_for}
                    </div>
                    <div className="text-[0.82rem] leading-snug text-[#374151]">
                      {getCatchLabel(item)}
                    </div>
                    <div className="text-[0.8rem] font-semibold text-[#31414b]">
                      {formatWeight(item.weight_g)}
                    </div>
                    <div className="line-clamp-1 text-[0.76rem] text-[#6b7280]">
                      {item.location_name || "Plats ej angiven"}
                    </div>
                    <div className="text-[0.76rem] text-[#6b7280]">
                      {formatDate(item.catch_date)}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {selectedImage ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img
              src={selectedImage}
              alt="Förstorad fångstbild"
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
              decoding="async"
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}