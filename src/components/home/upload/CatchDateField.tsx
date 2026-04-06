"use client";

type CatchDateFieldProps = {
  catchDate: string;
  onCatchDateChange: (value: string) => void;
};

function formatDisplayDate(value: string) {
  if (!value) {
    return "Datum för fångst";
  }

  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return value;
  }

  return `${year}-${month}-${day}`;
}

export default function CatchDateField({
  catchDate,
  onCatchDateChange,
}: CatchDateFieldProps) {
  return (
    <label className="relative block w-full cursor-pointer">
      <input
        type="date"
        value={catchDate}
        onChange={(e) => onCatchDateChange(e.target.value)}
        className="absolute inset-0 h-full w-full opacity-0"
        required
      />

      <div className="w-full rounded-2xl border border-[#d8d2c7] bg-white px-4 py-3 text-[#1f2937] outline-none transition">
        <span className={catchDate ? "text-[#1f2937]" : "text-[#9ca3af]"}>
          {formatDisplayDate(catchDate)}
        </span>
      </div>
    </label>
  );
}