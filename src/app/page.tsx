"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildAllTimeHighlights,
  buildBigFiveBreakdowns,
  buildLeaderboard,
} from "@/lib/home";
import type { LeaderboardFilter } from "@/types/home";
import { useHomeData } from "@/hooks/useHomeData";
import { useCatchUpload } from "@/hooks/useCatchUpload";
import LeaderboardSection from "@/components/home/LeaderboardSection";
import UploadCatchSection from "@/components/home/UploadCatchSection";
import RecentApprovedSection from "@/components/home/RecentApprovedSection";
import MapPreviewSection from "@/components/home/MapPreviewSection";

export default function Home() {
  const {
    members,
    approvedCatches,
    isHomeDataLoading,
    homeDataError,
    reloadHomeData,
    isLoggedIn,
    isAuthLoading,
    hasActiveMembership,
  } = useHomeData();

  const {
    caughtFor,
    registeredBy,
    fishType,
    fineFishType,
    weight,
    catchDate,
    locationName,
    latitude,
    longitude,
    gpsLoading,
    gpsError,
    formMessage,
    validationErrors,
    confirmMissingLocationOpen,
    mapOpen,
    previewUrl,
    fileInputKey,
    loading,
    handleRegisteredByChange,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleLocationNameChange,
    handleImageChange,
    handleCaughtForChange,
    handleFishTypeChange,
    handleGetGps,
    handleOpenMap,
    handleCloseMap,
    handleMapSelect,
    handleSubmit,
    dismissFormMessage,
    handleFormMessageAction,
    handleConfirmMissingLocation,
    handleCancelMissingLocation,
  } = useCatchUpload({
    isLoggedIn,
    hasActiveMembership,
  });

  const currentSwedenYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
    });

    return formatter.format(new Date());
  }, []);

  const availableLeaderboardYears = useMemo(() => {
    const startYear = 2016;
    const endYear = Number(currentSwedenYear);
    const years: string[] = [];

    for (let year = endYear; year >= startYear; year -= 1) {
      years.push(String(year));
    }

    return years;
  }, [currentSwedenYear]);

  const [filter, setFilter] = useState<LeaderboardFilter>("bigfive");
  const [selectedLeaderboardYear, setSelectedLeaderboardYear] =
    useState<string>(currentSwedenYear);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showSlowLoadingHelp, setShowSlowLoadingHelp] = useState(false);

  const isPageLoading = isHomeDataLoading || isAuthLoading;

  useEffect(() => {
    if (!isPageLoading) {
      setShowSlowLoadingHelp(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setShowSlowLoadingHelp(true);
    }, 3000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isPageLoading]);

  const leaderboardCatches = useMemo(() => {
    return approvedCatches.filter((catchItem) =>
      catchItem.catch_date?.startsWith(selectedLeaderboardYear)
    );
  }, [approvedCatches, selectedLeaderboardYear]);

  const leaderboard = useMemo(() => {
    return buildLeaderboard(leaderboardCatches, filter);
  }, [leaderboardCatches, filter]);

  const bigFiveBreakdowns = useMemo(() => {
    return buildBigFiveBreakdowns(leaderboardCatches);
  }, [leaderboardCatches]);

  const allTimeHighlights = useMemo(() => {
    return buildAllTimeHighlights(approvedCatches);
  }, [approvedCatches]);

  const recentApprovedCatches = useMemo(() => {
    return approvedCatches.slice(0, 6);
  }, [approvedCatches]);

  const handleFilterChange = useCallback((value: LeaderboardFilter) => {
    setFilter(value);
  }, []);

  const handleLeaderboardYearChange = useCallback((value: string) => {
    setSelectedLeaderboardYear(value);
  }, []);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleRetryHomeLoad = useCallback(() => {
    reloadHomeData();
  }, [reloadHomeData]);

  const handleHardReload = useCallback(() => {
    window.location.reload();
  }, []);

  if (isPageLoading) {
    return (
      <main className="px-4 pb-10 pt-4">
        <div className="mx-auto max-w-xl">
          <section className="rounded-[28px] border border-[#d8d2c7] bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <h1 className="text-2xl font-bold text-[#1f2937]">
              Laddar startsidan...
            </h1>

            <p className="mt-2 text-sm text-[#6b7280]">
              Vi hämtar medlemmar, godkända fångster och medlemsstatus.
            </p>

            {showSlowLoadingHelp ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-[#7a4b00]">
                <p className="font-semibold">Det här tar längre tid än väntat.</p>
                <p className="mt-1">
                  Om sidan öppnats från en genväg på telefonen kan en ny laddning
                  hjälpa.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRetryHomeLoad}
                    className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
                  >
                    Försök igen
                  </button>

                  <button
                    type="button"
                    onClick={handleHardReload}
                    className="rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
                  >
                    Ladda om sidan
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    );
  }

  if (homeDataError) {
    return (
      <main className="px-4 pb-10 pt-4">
        <div className="mx-auto max-w-xl">
          <section className="rounded-[28px] border border-red-200 bg-white/95 p-5 shadow-[0_8px_24px_rgba(18,35,28,0.06)]">
            <h1 className="text-2xl font-bold text-[#1f2937]">
              Kunde inte ladda startsidan
            </h1>

            <p className="mt-2 text-sm text-red-700">{homeDataError}</p>

            <p className="mt-2 text-sm text-[#6b7280]">
              Prova först igen. Hjälper inte det kan du ladda om sidan helt.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRetryHomeLoad}
                className="rounded-full bg-[#324b2f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#3e5d3b]"
              >
                Försök igen
              </button>

              <button
                type="button"
                onClick={handleHardReload}
                className="rounded-full border border-[#d8d2c7] bg-white px-4 py-2 text-sm font-semibold text-[#374151] transition hover:bg-[#f9f7f3]"
              >
                Ladda om sidan
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-xl">
        <div id="leaderboard-section" className="scroll-mt-[360px]">
          <LeaderboardSection
            leaderboard={leaderboard}
            members={members}
            filter={filter}
            onFilterChange={handleFilterChange}
            selectedYear={selectedLeaderboardYear}
            availableYears={availableLeaderboardYears}
            onYearChange={handleLeaderboardYearChange}
            allTimeHighlights={allTimeHighlights}
            bigFiveBreakdowns={bigFiveBreakdowns}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="upload-section" className="scroll-mt-[360px]">
          <UploadCatchSection
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            members={members}
            caughtFor={caughtFor}
            registeredBy={registeredBy}
            fishType={fishType}
            fineFishType={fineFishType}
            weight={weight}
            catchDate={catchDate}
            locationName={locationName}
            latitude={latitude}
            longitude={longitude}
            gpsLoading={gpsLoading}
            gpsError={gpsError}
            formMessage={formMessage}
            validationErrors={validationErrors}
            confirmMissingLocationOpen={confirmMissingLocationOpen}
            mapOpen={mapOpen}
            previewUrl={previewUrl}
            fileInputKey={fileInputKey}
            loading={loading}
            onSubmit={handleSubmit}
            onCaughtForChange={handleCaughtForChange}
            onRegisteredByChange={handleRegisteredByChange}
            onFishTypeChange={handleFishTypeChange}
            onFineFishTypeChange={handleFineFishTypeChange}
            onWeightChange={handleWeightChange}
            onCatchDateChange={handleCatchDateChange}
            onLocationNameChange={handleLocationNameChange}
            onGetGps={handleGetGps}
            onOpenMap={handleOpenMap}
            onCloseMap={handleCloseMap}
            onMapSelect={handleMapSelect}
            onImageChange={handleImageChange}
            onDismissFormMessage={dismissFormMessage}
            onFormMessageAction={handleFormMessageAction}
            onConfirmMissingLocation={handleConfirmMissingLocation}
            onCancelMissingLocation={handleCancelMissingLocation}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="approved-section" className="scroll-mt-[360px]">
          <RecentApprovedSection
            catches={recentApprovedCatches}
            onImageClick={handleImageClick}
          />
        </div>

        <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

        <div id="map-section" className="scroll-mt-[360px]">
          <MapPreviewSection
            isLoggedIn={isLoggedIn}
            hasActiveMembership={hasActiveMembership}
            catches={approvedCatches}
          />
        </div>

        {selectedImage ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={handleCloseSelectedImage}
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