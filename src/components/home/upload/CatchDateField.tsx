"use client";

type CatchDateFieldProps = {
  catchDate: string;
  onCatchDateChange: (value: string) => void;
};

export default function CatchDateField({
  catchDate,
  onCatchDateChange,
}: CatchDateFieldProps) {
  return (
    <div className="relative">
      <input
        type="date"
        value={catchDate}
        onChange={(e) => onCatchDateChange(e.target.value)}
        className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition focus:border-[#8b7b68] focus:ring-2 focus:ring-[#d9cfbf]"
        required
      />

      {!catchDate ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-[#9ca3af]">
          Datum för fångst
        </div>
      ) : null}
    </div>
  );
}