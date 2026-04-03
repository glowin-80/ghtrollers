"use client";

import { formatCatchDate } from "@/lib/home-upload";

type CatchDateFieldProps = {
  catchDate: string;
  onCatchDateChange: (value: string) => void;
  hasError?: boolean;
};

export default function CatchDateField({
  catchDate,
  onCatchDateChange,
  hasError = false,
}: CatchDateFieldProps) {
  const formattedCatchDate = formatCatchDate(catchDate);

  return (
    <div className="space-y-2">
      <label
        htmlFor="catch-date"
        className="block text-sm font-semibold text-[#4b5563]"
      >
        Datum för fångst
      </label>

      <input
        id="catch-date"
        type="date"
        value={catchDate}
        onChange={(e) => onCatchDateChange(e.target.value)}
        className={`date-input w-full rounded-2xl border bg-white px-4 py-3 text-[#1f2937] outline-none transition ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-[#d8d2c7] focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
        }`}
        required
      />

      <div className="min-h-[20px] text-sm text-[#6b7280]">
        {formattedCatchDate
          ? `Valt datum: ${formattedCatchDate}`
          : "Tryck för att välja datum"}
      </div>
    </div>
  );
}