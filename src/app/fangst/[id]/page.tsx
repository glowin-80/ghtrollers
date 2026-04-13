import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import ShareCatchButton from "@/components/shared/ShareCatchButton";
import {
  buildCatchShareDetails,
  formatCatchDateForDisplay,
  formatCatchWeightForDisplay,
} from "@/lib/catch-sharing";
import { isCompetitionEligibleCatch, isGuestAnglerRole } from "@/lib/ght-rules";
import {
  getCatchOwnerDisplayName,
  resolveCatchOwnerMember,
  buildMemberLookupById,
  buildMemberLookupByName,
} from "@/lib/catch-identity";
import {
  fetchAllApprovedCatches,
  fetchPublicActiveMembers,
  fetchPublicApprovedCatchById,
} from "@/lib/public-catch";

type CatchPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const getCatchPageData = cache(async (catchId: string) => {
  const catchItem = await fetchPublicApprovedCatchById(catchId);

  if (!catchItem) {
    return null;
  }

  const [approvedCatches, members] = await Promise.all([
    fetchAllApprovedCatches(),
    fetchPublicActiveMembers(),
  ]);

  const shareDetails = buildCatchShareDetails(catchItem, approvedCatches, members);

  return {
    catchItem,
    shareDetails: {
      ...shareDetails,
      members,
    },
  };
});

export async function generateMetadata({
  params,
}: CatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const data = await getCatchPageData(id);

  if (!data) {
    return {
      title: "Fångsten hittades inte | Gäddhäng Trollers",
      description: "Den här fångsten kunde inte visas.",
    };
  }

  const { catchItem, shareDetails } = data;
  const ownerDisplayName = getCatchOwnerDisplayName(
    catchItem,
    shareDetails.members
  );
  const title = `${ownerDisplayName} · ${shareDetails.fishLabel} · Gäddhäng Trollers`;
  const description = shareDetails.shareText;
  const catchUrl = `/fangst/${catchItem.id}`;
  const shareImageUrl = catchItem.image_url
    ? `/api/catch-image/${catchItem.id}`
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: catchUrl,
    },
    openGraph: {
      title,
      description,
      url: catchUrl,
      siteName: "Gäddhäng Trollers",
      type: "article",
      locale: "sv_SE",
      images: shareImageUrl
        ? [
            {
              url: shareImageUrl,
              alt: `${ownerDisplayName} med ${shareDetails.fishLabel}`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: shareImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: shareImageUrl ? [shareImageUrl] : undefined,
    },
  };
}

export default async function CatchPage({ params }: CatchPageProps) {
  const { id } = await params;
  const data = await getCatchPageData(id);

  if (!data) {
    notFound();
  }

  const { catchItem, shareDetails } = data;
  const memberById = buildMemberLookupById(shareDetails.members);
  const memberByName = buildMemberLookupByName(shareDetails.members);
  const owner = resolveCatchOwnerMember(catchItem, { memberById, memberByName });

  const catchBadgeLabel = isGuestAnglerRole(owner?.member_role)
    ? "Privat fångst"
    : isCompetitionEligibleCatch(catchItem, shareDetails.members)
      ? "Tävlings fångst"
      : "Privat fångst";

  const yearlyRankLabel = shareDetails.yearlyRank
    ? `Plats ${shareDetails.yearlyRank}${
        shareDetails.yearlyRankYear ? ` · ${shareDetails.yearlyRankYear}` : ""
      }`
    : "Placering saknas";

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-xl">
        <section className="overflow-hidden rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] shadow-[0_12px_36px_rgba(18,35,28,0.08)]">
          {catchItem.image_url ? (
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#ebe7de]">
              <img
                src={catchItem.image_url}
                alt={`${getCatchOwnerDisplayName(
                  catchItem,
                  shareDetails.members
                )} med ${shareDetails.fishLabel}`}
                className="h-full w-full object-cover"
                decoding="async"
              />
            </div>
          ) : null}

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-[#7a6540]">
                  {catchBadgeLabel}
                </div>
                <h1 className="mt-2 text-[2rem] font-bold leading-[0.96] text-[#1f2937] sm:text-[2.2rem]">
                  {getCatchOwnerDisplayName(catchItem, shareDetails.members)}
                </h1>
                <p className="mt-2 text-[1.05rem] text-[#5b6871]">
                  {shareDetails.fishLabel} ·{" "}
                  {formatCatchWeightForDisplay(catchItem.weight_g)}
                </p>
              </div>

              <ShareCatchButton
                catchId={catchItem.id}
                shareTitle={shareDetails.shareTitle}
                shareText={shareDetails.shareText}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-[#d8d2c7] bg-white px-4 py-3 shadow-sm">
                <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#7a6540]">
                  Fångstdatum
                </div>
                <div className="mt-2 text-[1rem] font-semibold text-[#1f2937]">
                  {formatCatchDateForDisplay(catchItem.catch_date)}
                </div>
              </div>

              <div className="rounded-[22px] border border-[#d8d2c7] bg-white px-4 py-3 shadow-sm">
                <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#7a6540]">
                  Årsplacering
                </div>
                <div className="mt-2 text-[1rem] font-semibold text-[#1f2937]">
                  {yearlyRankLabel}
                </div>
              </div>
            </div>

            {shareDetails.isCurrentAllTimeLeader ? (
              <div className="mt-4 rounded-[24px] border border-[#dccb97] bg-[#fff8e7] px-4 py-4 text-[#5c4d3f] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
                  All-Time-High
                </div>
                <div className="mt-2 text-[1rem] font-semibold leading-snug">
                  Den här fångsten är just nu etta i All-Time-High för{" "}
                  {shareDetails.categoryLabel}.
                </div>
              </div>
            ) : null}

            <div className="mt-5 rounded-[24px] border border-[#d8d2c7] bg-white px-4 py-4 shadow-sm">
              <div className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-[#7a6540]">
                Delningstext
              </div>
              <p className="mt-2 text-sm leading-6 text-[#374151]">
                {shareDetails.shareText}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/#approved-section"
                className="rounded-full border border-[#d7d0c3] bg-white px-4 py-2 text-sm font-semibold text-[#31414b] transition hover:bg-[#f2efe8]"
              >
                Till startsidan
              </Link>

              <Link
                href="/galleri"
                className="rounded-full border border-[#d7d0c3] bg-white px-4 py-2 text-sm font-semibold text-[#31414b] transition hover:bg-[#f2efe8]"
              >
                Öppna galleri
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}