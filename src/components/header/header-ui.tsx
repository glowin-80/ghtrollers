function getFallbackIcon() {
  return "★";
}

export function TopBubble({ imageUrl, alt }: { imageUrl?: string | null; alt: string }) {
  if (imageUrl) {
    return (
      <div className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#d2b77a] bg-[#29441f] shadow-[0_2px_7px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.22)]">
        <img src={imageUrl} alt={alt} draggable={false} className="h-[46px] w-[46px] rounded-full object-cover" />
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#d2b77a] bg-[linear-gradient(180deg,#6c8655_0%,#466233_100%)] text-[#f3ddb0] shadow-[0_2px_7px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.24)]">
      <span className="text-[24px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.20)]">{getFallbackIcon()}</span>
    </div>
  );
}

export function SmallMenuBubble({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "absolute left-0 top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#d2b77a]",
        "shadow-[0_2px_6px_rgba(0,0,0,0.10),inset_0_1px_0_rgba(255,255,255,0.24)]",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="text-[16px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]">{getFallbackIcon()}</span>
    </div>
  );
}

export function MobileTopButton({
  label,
  onClick,
  imageUrl,
  showArrow = false,
  isExpanded = false,
}: {
  label: string;
  onClick: () => void;
  imageUrl?: string | null;
  showArrow?: boolean;
  isExpanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-[52px] w-full items-center overflow-visible rounded-full border border-[#bfa76a] bg-[linear-gradient(180deg,#2b4c20_0%,#183417_100%)] pr-[12px] pl-[64px] shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-transform duration-200 active:scale-[0.99]"
    >
      <TopBubble imageUrl={imageUrl} alt={label} />
      <span className="truncate text-[15px] font-semibold uppercase tracking-[0.04em] text-[#ead8ab]">{label}</span>
      {showArrow ? (
        <span
          aria-hidden="true"
          className={[
            "ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-[14px] font-bold leading-none text-[#ead8ab] shadow-[0_1px_2px_rgba(0,0,0,0.28)] transition-transform duration-200",
            isExpanded ? "rotate-180" : "rotate-0",
          ].join(" ")}
        >
          ▼
        </span>
      ) : null}
    </button>
  );
}
