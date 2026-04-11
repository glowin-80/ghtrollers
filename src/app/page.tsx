"use client";

import { useCallback, useMemo, useState } from "react";
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
import HashSectionScroller from "@/components/shared/HashSectionScroller";

export default function Home() {
  const {
    members,
    approvedCatches,
    approvedFishingSpots,
    isLoggedIn,
    hasActiveMembership,
    member,
    isSuperAdmin,
  } = useHomeData();

  const {
    caughtFor,
    registeredBy,
    fishType,
    fineFishType,
    weight,
    catchDate,
    fishingMethod,
    liveScope,
    caughtAbroad,
    isLocationPrivate,
    locationName,
    latitude,
    longitude,
    gpsLoading,
    gpsError,
    formMessage,
    confirmMissingLocationOpen,
    mapOpen,
    locationChooserOpen,
    previewUrl,
    fileInputKey,
    loading,
    handleFineFishTypeChange,
    handleWeightChange,
    handleCatchDateChange,
    handleFishingMethodChange,
    handleLiveScopeChange,
    handleCaughtAbroadChange,
    handleIsLocationPrivateChange,
    handleLocationNameChange,
    handleImageChange,
    handleCaughtForChange,
    handleFishTypeChange,
    handleOpenLocationChooser,
    handleCloseLocationChooser,
    handleSaveManualLocation,
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
    registeredByDefault: member?.name ?? "",
    isGuestAngler: member?.member_role === "guest_angler",
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

  const leaderboardCatches = useMemo(() => {
    return approvedCatches.filter((catchItem) =>
      catchItem.catch_date?.startsWith(selectedLeaderboardYear)
    );
  }, [approvedCatches, selectedLeaderboardYear]);

  const leaderboard = useMemo(() => {
    return buildLeaderboard(leaderboardCatches, filter, members);
  }, [leaderboardCatches, filter, members]);

  const bigFiveBreakdowns = useMemo(() => {
    return buildBigFiveBreakdowns(leaderboardCatches, members);
  }, [leaderboardCatches, members]);

  const allTimeHighlights = useMemo(() => {
    return buildAllTimeHighlights(approvedCatches, members);
  }, [approvedCatches, members]);

  const recentApprovedCatches = useMemo(() => {
    return approvedCatches.slice(0, 8);
  }, [approvedCatches, members]);

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

  return (
    <>
      <HashSectionScroller
        watchValues={[
          members.length,
          approvedCatches.length,
          approvedFishingSpots.length,
          isLoggedIn,
          hasActiveMembership,
        ]}
      />

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
              fishingMethod={fishingMethod}
              liveScope={liveScope}
              caughtAbroad={caughtAbroad}
              isLocationPrivate={isLocationPrivate}
              isGuestAngler={member?.member_role === "guest_angler"}
              locationName={locationName}
              latitude={latitude}
              longitude={longitude}
              gpsLoading={gpsLoading}
              gpsError={gpsError}
              formMessage={formMessage}
              confirmMissingLocationOpen={confirmMissingLocationOpen}
              mapOpen={mapOpen}
              locationChooserOpen={locationChooserOpen}
              previewUrl={previewUrl}
              fileInputKey={fileInputKey}
              loading={loading}
              onSubmit={handleSubmit}
              onCaughtForChange={handleCaughtForChange}
              onFishTypeChange={handleFishTypeChange}
              onFineFishTypeChange={handleFineFishTypeChange}
              onWeightChange={handleWeightChange}
              onCatchDateChange={handleCatchDateChange}
              onFishingMethodChange={handleFishingMethodChange}
              onLiveScopeChange={handleLiveScopeChange}
              onCaughtAbroadChange={handleCaughtAbroadChange}
              onIsLocationPrivateChange={handleIsLocationPrivateChange}
              onLocationNameChange={handleLocationNameChange}
              onOpenLocationChooser={handleOpenLocationChooser}
              onCloseLocationChooser={handleCloseLocationChooser}
              onSaveManualLocation={handleSaveManualLocation}
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
              allApprovedCatches={approvedCatches}
              isLoggedIn={isLoggedIn}
              members={members}
              onImageClick={handleImageClick}
            />
          </div>

          <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-black/15 to-transparent" />

          <div id="map-section" className="scroll-mt-[360px]">
            <MapPreviewSection
              isLoggedIn={isLoggedIn}
              hasActiveMembership={hasActiveMembership}
              catches={approvedCatches}
              fishingSpots={approvedFishingSpots}
              isSuperAdmin={isSuperAdmin}
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
    </>
  );
}