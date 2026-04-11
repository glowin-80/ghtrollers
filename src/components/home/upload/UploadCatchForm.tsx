"use client";

import type { FormEvent } from "react";
import type { Member } from "@/types/home";
import type { GpsErrorState, UploadFeedbackMessage } from "@/components/home/upload/types";
import InlineMessage from "@/components/shared/InlineMessage";
import CatchDateField from "@/components/home/upload/CatchDateField";
import GpsPermissionHelp from "@/components/home/upload/GpsPermissionHelp";

type UploadCatchFormProps = {
  members: Member[];
  caughtFor: string;
  registeredBy: string;
  fishType: string;
  fineFishType: string;
  weight: string;
  catchDate: string;
  fishingMethod: string;
  liveScope: boolean;
  caughtAbroad: boolean;
  isLocationPrivate: boolean;
  isGuestAngler?: boolean;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: GpsErrorState | null;
  formMessage: UploadFeedbackMessage | null;
  previewUrl: string | null;
  fileInputKey: number;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  onCaughtForChange: (value: string) => void;
  onFishTypeChange: (value: string) => void;
  onFineFishTypeChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onCatchDateChange: (value: string) => void;
  onFishingMethodChange: (value: string) => void;
  onLiveScopeChange: (value: boolean) => void;
  onCaughtAbroadChange: (value: boolean) => void;
  onIsLocationPrivateChange: (value: boolean) => void;
  onOpenLocationChooser: () => void;
  onGetGps: () => void;
  onOpenMap: () => void;
  onImageChange: (file: File | null) => void;
  onDismissFormMessage: () => void;
  onFormMessageAction: () => void;
};

export default function UploadCatchForm({ members, caughtFor, registeredBy, fishType, fineFishType, weight, catchDate, fishingMethod, liveScope, caughtAbroad, isLocationPrivate, isGuestAngler = false, locationName, latitude, longitude, gpsLoading, gpsError, formMessage, previewUrl, fileInputKey, loading, onSubmit, onCaughtForChange, onFishTypeChange, onFineFishTypeChange, onWeightChange, onCatchDateChange, onFishingMethodChange, onLiveScopeChange, onCaughtAbroadChange, onIsLocationPrivateChange, onOpenLocationChooser, onGetGps, onOpenMap, onImageChange, onDismissFormMessage, onFormMessageAction }: UploadCatchFormProps) {
  const hasLocationSelection = locationName.trim().length > 0 || latitude !== null || longitude !== null;
  const locationSummary = locationName.trim() || "Saknas";
  const locationSummaryTextClass = hasLocationSelection ? "text-[#374151]" : "text-[#9ca3af]";
  const selectedFileName = previewUrl ? "Bild vald" : "Ingen bild vald";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formMessage ? <InlineMessage variant={formMessage.variant} message={formMessage.message} actionLabel={formMessage.actionLabel} onAction={formMessage.actionLabel ? onFormMessageAction : undefined} onDismiss={onDismissFormMessage} /> : null}
      {isGuestAngler ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Du är ej aktiv medlem i tävlingen "Gäddhäng Trollers", denna fångst kommer inte registreras under leaderboard och all-time-high
        </div>
      ) : null}
      <select value={caughtFor} onChange={(e) => onCaughtForChange(e.target.value)} className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]" required><option value="">Välj vem som fångade fisken</option>{members.map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}</select>
      <div className="w-full rounded-2xl border border-[#d8d2c7] bg-[#f8f5ef] px-4 py-3 text-[#1f2937]"><div className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Registrerad av</div><div className="text-sm font-medium">{registeredBy || "Ingen inloggad registrerare"}</div></div>
      <select value={fishType} onChange={(e) => onFishTypeChange(e.target.value)} className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]" required><option value="">Välj art</option><option value="Gädda">Gädda</option><option value="Abborre">Abborre</option><option value="Fina fisken">Fina fisken</option></select>
      {fishType === "Fina fisken" ? <input type="text" value={fineFishType} onChange={(e) => onFineFishTypeChange(e.target.value)} placeholder="Art på fina fisken (t.ex. Gös)" className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]" required /> : null}
      <input type="number" inputMode="numeric" value={weight} onChange={(e) => onWeightChange(e.target.value)} placeholder="Vikt (gram)" className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]" required />
      <CatchDateField catchDate={catchDate} onCatchDateChange={onCatchDateChange} />
      <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-4 text-sm text-[#374151]">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6b7280]">Fiskemetoder</div>
        <select value={fishingMethod} onChange={(e) => onFishingMethodChange(e.target.value)} className="mt-3 w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]" required><option value="">Välj fiskemetod</option><option value="Trolling">Trolling</option><option value="Spinnfiske">Spinnfiske</option><option value="Metspö">Metspö</option></select>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-start gap-3 rounded-2xl border border-[#e5ddd0] bg-white px-4 py-3"><input type="checkbox" checked={liveScope} onChange={(e) => onLiveScopeChange(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]" /><span><span className="block font-semibold text-[#1f2937]">Live-scope</span><span className="mt-1 block text-xs leading-5 text-[#6b7280]">Fångster med Live-scope räknas inte i tävlingen.</span></span></label>
          <label className="flex items-start gap-3 rounded-2xl border border-[#e5ddd0] bg-white px-4 py-3"><input type="checkbox" checked={caughtAbroad} onChange={(e) => onCaughtAbroadChange(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]" /><span><span className="block font-semibold text-[#1f2937]">Utomlands</span><span className="mt-1 block text-xs leading-5 text-[#6b7280]">Fångster utomlands räknas inte i tävlingen.</span></span></label>
        </div>
      </div>
      <button type="button" onClick={onOpenLocationChooser} className="w-full rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6]">📍 Ange plats för fångst</button>
      <GpsPermissionHelp gpsError={gpsError} gpsLoading={gpsLoading} onRetry={onGetGps} onOpenMap={onOpenMap} />
      <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm"><div className={`font-medium ${locationSummaryTextClass}`}>Plats: {locationSummary}</div><div className={locationSummaryTextClass}>Latitud: {latitude ?? "Saknas"}</div><div className={locationSummaryTextClass}>Longitud: {longitude ?? "Saknas"}</div><label className="mt-3 flex items-start gap-3 rounded-2xl border border-[#e5ddd0] bg-white px-4 py-3"><input type="checkbox" checked={isLocationPrivate} onChange={(e) => onIsLocationPrivateChange(e.target.checked)} className="mt-1 h-4 w-4 rounded border-[#cfc6b8] text-[#324b2f] focus:ring-[#d9cfbf]" /><span><span className="block font-semibold text-[#1f2937]">Gör platsen privat</span><span className="mt-1 block text-xs leading-5 text-[#6b7280]">Privat plats syns bara för dig själv.</span></span></label></div>
      <label htmlFor={`catch-image-upload-${fileInputKey}`} className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] transition hover:border-[#c8c1b4]"><span className="font-medium">Välj fångstbild</span><span className="text-sm text-[#9ca3af]">{selectedFileName}</span></label>
      <input key={fileInputKey} id={`catch-image-upload-${fileInputKey}`} type="file" accept="image/*" onChange={(e) => onImageChange(e.target.files?.[0] || null)} className="hidden" required />
      {previewUrl ? <div className="overflow-hidden rounded-2xl border border-[#d8d2c7] bg-white"><img src={previewUrl} alt="Förhandsvisning" className="h-auto max-h-[420px] w-full object-cover" /></div> : null}
      <button type="submit" disabled={loading} className="w-full rounded-2xl bg-[#53b846] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#63c456] disabled:cursor-not-allowed disabled:opacity-70">{loading ? "Skickar..." : "Skicka fångst"}</button>
    </form>
  );
}
