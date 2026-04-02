"use client";

import { useCallback, useMemo, useState } from "react";
import { buildLeaderboard } from "@/lib/home";
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
    isLoggedIn,
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
  } = useCatchUpload({
    isLoggedIn,
    hasActiveMembership,
  });

  const [filter, setFilter] = useState<LeaderboardFilter>("bigfive");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const leaderboard = useMemo(() => {
    return buildLeaderboard(approvedCatches, filter);
  }, [approvedCatches, filter]);

  const recentApprovedCatches = useMemo(() => {
    return approvedCatches.slice(0, 5);
  }, [approvedCatches]);

  const handleFilterChange = useCallback((value: LeaderboardFilter) => {
    setFilter(value);
  }, []);

  const handleImageClick = useCallback((url: string) => {
    setSelectedImage(url);
  }, []);

  const handleCloseSelectedImage = useCallback(() => {
    setSelectedImage(null);
  }, []);

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-xl">
        <div id="leaderboard-section" className="scroll-mt-[360px]">
          <LeaderboardSection
            leaderboard={leaderboard}
            members={members}
            filter={filter}
            onFilterChange={handleFilterChange}
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
