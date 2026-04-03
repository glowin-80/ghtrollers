"use client";

import type { FormEvent } from "react";
import type { Member } from "@/types/home";
import type {
  GpsErrorState,
  UploadFeedbackMessage,
  UploadValidationField,
} from "@/components/home/upload/types";
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
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  gpsLoading: boolean;
  gpsError: GpsErrorState | null;
  formMessage: UploadFeedbackMessage | null;
  validationErrors: Partial<Record<UploadValidationField, boolean>>;
  previewUrl: string | null;
  fileInputKey: number;
  loading: boolean;
  onSubmit: (e: FormEvent) => void;
  onCaughtForChange: (value: string) => void;
  onRegisteredByChange: (value: string) => void;
  onFishTypeChange: (value: string) => void;
  onFineFishTypeChange: (value: string) => void;
  onWeightChange: (value: string) => void;
  onCatchDateChange: (value: string) => void;
  onLocationNameChange: (value: string) => void;
  onGetGps: () => void;
  onOpenMap: () => void;
  onImageChange: (file: File | null) => void;
  onDismissFormMessage: () => void;
  onFormMessageAction: () => void;
};

const baseFieldClassName =
  "w-full rounded-2xl border bg-white px-4 py-3 text-[#1f2937] outline-none transition";

const defaultFieldClassName =
  "border-[#d8d2c7] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]";

const errorFieldClassName =
  "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100";

function getFieldClassName(hasError: boolean) {
  return `${baseFieldClassName} ${
    hasError ? errorFieldClassName : defaultFieldClassName
  }`;
}

export default function UploadCatchForm({
  members,
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
  previewUrl,
  fileInputKey,
  loading,
  onSubmit,
  onCaughtForChange,
  onRegisteredByChange,
  onFishTypeChange,
  onFineFishTypeChange,
  onWeightChange,
  onCatchDateChange,
  onLocationNameChange,
  onGetGps,
  onOpenMap,
  onImageChange,
  onDismissFormMessage,
  onFormMessageAction,
}: UploadCatchFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {formMessage ? (
        <InlineMessage
          variant={formMessage.variant}
          message={formMessage.message}
          actionLabel={formMessage.actionLabel}
          onAction={formMessage.actionLabel ? onFormMessageAction : undefined}
          onDismiss={onDismissFormMessage}
        />
      ) : null}

      <select
        value={caughtFor}
        onChange={(e) => onCaughtForChange(e.target.value)}
        className={getFieldClassName(Boolean(validationErrors.caughtFor))}
        required
      >
        <option value="">Välj vem som fångade fisken</option>
        {members.map((member) => (
          <option key={member.id} value={member.name}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        value={registeredBy}
        onChange={(e) => onRegisteredByChange(e.target.value)}
        className={getFieldClassName(Boolean(validationErrors.registeredBy))}
        required
      >
        <option value="">Välj vem som registrerar</option>
        {members.map((member) => (
          <option key={member.id} value={member.name}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        value={fishType}
        onChange={(e) => onFishTypeChange(e.target.value)}
        className={getFieldClassName(Boolean(validationErrors.fishType))}
        required
      >
        <option value="">Välj art</option>
        <option value="Gädda">Gädda</option>
        <option value="Abborre">Abborre</option>
        <option value="Fina fisken">Fina fisken</option>
      </select>

      {fishType === "Fina fisken" ? (
        <input
          type="text"
          value={fineFishType}
          onChange={(e) => onFineFishTypeChange(e.target.value)}
          placeholder="Art på fina fisken (t.ex. Gös)"
          className={getFieldClassName(Boolean(validationErrors.fineFishType))}
          required
        />
      ) : null}

      <input
        type="number"
        inputMode="numeric"
        value={weight}
        onChange={(e) => onWeightChange(e.target.value)}
        placeholder="Vikt (gram)"
        className={getFieldClassName(Boolean(validationErrors.weight))}
        required
      />

      <CatchDateField
        catchDate={catchDate}
        onCatchDateChange={onCatchDateChange}
        hasError={Boolean(validationErrors.catchDate)}
      />

      <input
        type="text"
        value={locationName}
        onChange={(e) => onLocationNameChange(e.target.value)}
        placeholder="Plats (valfritt)"
        className={getFieldClassName(false)}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onGetGps}
          disabled={gpsLoading}
          className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {gpsLoading ? "Hämtar GPS..." : "📍 Hämta GPS-position"}
        </button>

        <button
          type="button"
          onClick={onOpenMap}
          className="rounded-2xl bg-[#1f46d8] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#264fe6]"
        >
          🗺️ Importera plats från karta
        </button>
      </div>

      <GpsPermissionHelp
        gpsError={gpsError}
        gpsLoading={gpsLoading}
        onRetry={onGetGps}
        onOpenMap={onOpenMap}
      />

      <div className="rounded-2xl border border-[#d8d2c7] bg-[#fffdfb] px-4 py-3 text-sm text-[#4b5563]">
        <div>Latitud: {latitude ?? "Saknas"}</div>
        <div>Longitud: {longitude ?? "Saknas"}</div>
      </div>

      <input
        key={fileInputKey}
        type="file"
        accept="image/*"
        onChange={(e) => onImageChange(e.target.files?.[0] || null)}
        className={getFieldClassName(Boolean(validationErrors.imageFile))}
        required
      />

      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-[#d8d2c7] bg-white">
          <img
            src={previewUrl}
            alt="Förhandsvisning"
            className="h-auto max-h-[420px] w-full object-cover"
          />
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-[#53b846] px-4 py-4 text-base font-semibold text-white transition hover:bg-[#63c456] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Skickar..." : "Skicka fångst"}
      </button>
    </form>
  );
}