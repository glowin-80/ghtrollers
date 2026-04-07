"use client";

import Link from "next/link";
import { useState } from "react";

type PublicSection = {
  id: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  links?: Array<{ label: string; href: string }>;
};

const publicSections: PublicSection[] = [
  {
    id: "fiskarter",
    title: "Fiskarter",
    description:
      "Översikt över vanliga arter i området och hur vanligt förekommande de är i vattnen runt Storsjöns FVOF Sandviken.",
    imageSrc: "/sfvof/public-section-1.png",
    imageAlt: "Översikt över fiskarter och förekomstnivåer.",
  },
  {
    id: "fiskekort",
    title: "Fiskekort och kontakt",
    description:
      "Tillfällig informationssektion med kontaktpersoner och praktisk översikt för köp av fiskekort.",
    imageSrc: "/sfvof/public-section-2.png",
    imageAlt: "Informationssida för Storsjöns FVOF Sandviken med karta och kontaktpersoner.",
  },
  {
    id: "filer",
    title: "Filer för nedladdning",
    description:
      "Tillfälligt dokumentgalleri för protokoll, verksamhetsberättelser och översiktskartor.",
    imageSrc: "/sfvof/public-section-3.png",
    imageAlt: "Sektion med filer för nedladdning.",
  },
  {
    id: "omraden",
    title: "Fiskeområden i närheten",
    description:
      "Snabblänkar till omkringliggande fiskeområden via iFiske.",

    links: [
      {
        label: "Ottnaren och Ältebosjön med tillrinnande vattendrag",
        href: "https://www.ifiske.se/fiske-ottnaren-och-altebosjon-med-tillrinnande-vattendrag.htm",
      },
      {
        label: "Öjaren m fl sjöar",
        href: "https://www.ifiske.se/fiske-ojaren-m-fl-sjoar.htm",
      },
      {
        label: "Medskogssjöns SFK",
        href: "https://www.ifiske.se/fiske-medskogssjons-sfk.htm",
      },
      {
        label: "Järbo FVOF",
        href: "https://www.ifiske.se/fiske-jarbo-fvof.htm",
      },
      {
        label: "Järbo SFK Djuptjärn och Svarttjärn",
        href: "https://www.ifiske.se/fiske-jarbo-sfk-djuptjarn-och-svarttjarn.htm",
      },
    ],
  },
];

function TopBubble({ label }: { label: string }) {
  return (
    <div className="absolute left-0 top-1/2 flex h-[52px] w-[52px] -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#d2b77a] bg-[linear-gradient(180deg,#6c8655_0%,#466233_100%)] text-[#f3ddb0] shadow-[0_2px_7px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.24)]">
      <span className="text-[16px] font-bold uppercase tracking-[0.08em] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.20)]">
        {label}
      </span>
    </div>
  );
}

function TopButton({
  label,
  bubbleLabel,
  onClick,
  showArrow = false,
  isExpanded = false,
  href,
}: {
  label: string;
  bubbleLabel: string;
  onClick?: () => void;
  showArrow?: boolean;
  isExpanded?: boolean;
  href?: string;
}) {
  const className =
    "relative flex h-[52px] w-full items-center overflow-visible rounded-full border border-[#bfa76a] bg-[linear-gradient(180deg,#2b4c20_0%,#183417_100%)] pr-[12px] pl-[64px] shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]";

  const inner = (
    <>
      <TopBubble label={bubbleLabel} />
      <span className="truncate text-[15px] font-semibold uppercase tracking-[0.04em] text-[#ead8ab]">
        {label}
      </span>
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
      ) : (
        <span
          aria-hidden="true"
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/35 text-[18px] leading-none text-[#ead8ab]"
        >
          ›
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

function PublicSectionCard({ section }: { section: PublicSection }) {
  return (
    <section
      id={section.id}
      className="overflow-hidden rounded-[28px] border border-[#d6ddd5] bg-white shadow-[0_12px_32px_rgba(19,38,30,0.08)]"
    >
      <div className="border-b border-[#e7ede7] px-5 py-5 sm:px-6">
        <div className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-[#5d775f]">
          Öppen sektion
        </div>
        <h2 className="mt-2 text-[1.55rem] font-bold leading-tight text-[#1e3528] sm:text-[1.8rem]">
          {section.title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#516257] sm:text-[0.98rem]">
          {section.description}
        </p>
      </div>

      <div className="bg-[#f7faf7] p-4 sm:p-5">
        {section.imageSrc ? (
          <div className="overflow-hidden rounded-[22px] border border-[#dbe3db] bg-white shadow-[0_8px_22px_rgba(19,38,30,0.07)]">
            <img
              src={section.imageSrc}
              alt={section.imageAlt ?? section.title}
              className="w-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}

        {section.links?.length ? (
          <div className={`${section.imageSrc ? 'mt-5 ' : ''}rounded-[22px] border border-[#dbe3db] bg-white px-4 py-4 shadow-[0_8px_22px_rgba(19,38,30,0.05)] sm:px-5`}>
            <div className="text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-[#5d775f]">
              Länkar
            </div>
            <div className="mt-3 flex flex-col gap-2.5">
              {section.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[16px] border border-[#dbe3db] bg-[#f7faf7] px-4 py-3 text-sm font-medium text-[#1e3528] transition hover:bg-[#eef5ee]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function SfvofHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-transparent pb-12 text-[#1f2937]">
      <header className="w-full">
        <div className="relative h-[220px] w-full overflow-hidden bg-[#dfe7e1] sm:h-[320px] md:h-[380px]">
          <img
            src="/sfvof/header.jpg"
            alt="Storsjöns FVOF Sandviken"
            className="h-full w-full object-contain object-center"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,17,13,0.08)_0%,rgba(6,17,13,0.22)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-5 sm:px-6 sm:pb-8">
            <div className="mx-auto max-w-6xl">
              <h1 className="text-[1.9rem] font-bold leading-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.55)] sm:text-[2.5rem]">
                Storsjöns FVOF Sandviken
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-40 border-b border-black/10 bg-[#edf2ee]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-4">
          <div className="relative sm:hidden">
            <div className="grid grid-cols-2 gap-[10px]">
              <TopButton
                label="Meny"
                bubbleLabel="M"
                onClick={() => setIsMenuOpen((current) => !current)}
                showArrow
                isExpanded={isMenuOpen}
              />
              <TopButton label="Login" bubbleLabel="L" href="/sfvof/login" />
            </div>

            <div
              className={[
                "overflow-hidden transition-all duration-300 ease-out",
                isMenuOpen ? "mt-3 max-h-[180px] opacity-100" : "mt-0 max-h-0 opacity-0",
              ].join(" ")}
            >
              <div className="rounded-[22px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[10px] shadow-[0_16px_34px_rgba(0,0,0,0.16)]">
                <div className="rounded-[18px] border border-dashed border-[#d2bc8a] bg-[#fff9ef] px-4 py-4 text-sm text-[#6c5b3d]">
                  Menyn är tom just nu.
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block">
            <div className="rounded-[26px] border border-[#cbb489] bg-[linear-gradient(180deg,rgba(252,246,235,0.96)_0%,rgba(235,224,202,0.93)_100%)] p-[10px] shadow-[0_16px_34px_rgba(0,0,0,0.14)]">
              <div className="flex flex-wrap items-stretch justify-center gap-[10px]">
                <div className="min-w-[220px] max-w-[260px] flex-1">
                  <TopButton
                    label="Meny"
                    bubbleLabel="M"
                    onClick={() => setIsMenuOpen((current) => !current)}
                    showArrow
                    isExpanded={isMenuOpen}
                  />
                </div>
                <div className="min-w-[220px] max-w-[260px] flex-1">
                  <TopButton label="Login" bubbleLabel="L" href="/sfvof/login" />
                </div>
              </div>

              {isMenuOpen ? (
                <div className="mt-3 rounded-[18px] border border-dashed border-[#d2bc8a] bg-[#fff9ef] px-4 py-4 text-sm text-[#6c5b3d]">
                  Menyn är tom just nu.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <section className="px-4 pt-6 sm:px-5">
        <div className="mx-auto max-w-6xl space-y-6">
          {publicSections.map((section) => (
            <PublicSectionCard key={section.id} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
