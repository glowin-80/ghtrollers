"use client";

import { useEffect, useState } from "react";
import { getSfvofAccessState } from "@sfvof/lib/get-access-state";
import type { SfvofAccessState, SfvofMeasurement } from "@sfvof/types";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | ({ status: "ready" } & SfvofAccessState);

function formatMeasuredAt(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatCoordinate(value: number) {
  return value.toFixed(6);
}

function MeasurementCard({ measurement }: { measurement: SfvofMeasurement }) {
  return (
    <article className="rounded-[24px] border border-[#d8d2c7] bg-white/80 p-4 shadow-[0_8px_22px_rgba(18,35,28,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#7a6540]">
            {measurement.length_interval_label}
          </div>
          <h3 className="mt-1 text-[1.2rem] font-bold text-[#1f2937]">
            {measurement.fish_length_cm} cm
          </h3>
        </div>

        <div className="rounded-full border border-[#d8d2c7] bg-[#f6f2ea] px-3 py-1 text-[0.78rem] font-semibold text-[#5c4d3f]">
          {measurement.is_approved ? "Sparad" : "Ej godkänd"}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#4b5563] sm:grid-cols-2">
        <div className="rounded-[18px] bg-[#faf7f1] px-3 py-2.5">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
            Mätt
          </dt>
          <dd className="mt-1 font-medium text-[#1f2937]">
            {formatMeasuredAt(measurement.measured_at)}
          </dd>
        </div>

        <div className="rounded-[18px] bg-[#faf7f1] px-3 py-2.5">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
            Registrerad av
          </dt>
          <dd className="mt-1 font-medium text-[#1f2937]">
            {measurement.registered_by_name}
          </dd>
        </div>

        <div className="rounded-[18px] bg-[#faf7f1] px-3 py-2.5 sm:col-span-2">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
            GPS
          </dt>
          <dd className="mt-1 font-medium text-[#1f2937]">
            {formatCoordinate(measurement.gps_lat)}, {formatCoordinate(measurement.gps_lng)}
          </dd>
        </div>

        {measurement.comment ? (
          <div className="rounded-[18px] bg-[#faf7f1] px-3 py-2.5 sm:col-span-2">
            <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
              Kommentar
            </dt>
            <dd className="mt-1 font-medium text-[#1f2937]">{measurement.comment}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}

export default function SfvofHomePage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const accessState = await getSfvofAccessState();

        if (!isMounted) {
          return;
        }

        setState({
          status: "ready",
          ...accessState,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Kunde inte läsa SFVOF-data just nu.";

        setState({
          status: "error",
          message,
        });
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="px-4 pb-10 pt-4">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[30px] border border-[#d8d2c7] bg-[#fcfbf8] p-5 shadow-[0_12px_30px_rgba(18,35,28,0.08)] sm:p-6">
          <div className="text-[0.92rem] font-medium tracking-wide text-[#74685a]">
            Storsjöns FVOF
          </div>
          <h1 className="mt-2 text-[2rem] font-bold leading-none text-[#1f2937] sm:text-[2.3rem]">
            SFVOF – basvy
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
            Detta är en första helt isolerad sida för SFVOF. Den läser bara data från
            schema <span className="font-semibold text-[#374151]">sfvof</span> och
            visar inget från Gäddhäng Trollers.
          </p>
        </section>

        <div className="mt-6 space-y-6">
          {state.status === "loading" ? (
            <section className="rounded-[26px] border border-[#d8d2c7] bg-white/80 p-5 text-sm text-[#4b5563] shadow-[0_10px_24px_rgba(18,35,28,0.06)]">
              Läser SFVOF-data...
            </section>
          ) : null}

          {state.status === "error" ? (
            <section className="rounded-[26px] border border-[#d8d2c7] bg-white/80 p-5 shadow-[0_10px_24px_rgba(18,35,28,0.06)]">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#7a6540]">
                Fel
              </div>
              <p className="mt-2 text-sm leading-6 text-[#4b5563]">{state.message}</p>
            </section>
          ) : null}

          {state.status === "ready" ? (
            <>
              <section className="rounded-[26px] border border-[#d8d2c7] bg-white/80 p-5 shadow-[0_10px_24px_rgba(18,35,28,0.06)]">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[20px] bg-[#faf7f1] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
                      Inloggad
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2937]">
                      {state.isLoggedIn ? "Ja" : "Nej"}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[#faf7f1] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
                      SFVOF-medlem
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2937]">
                      {state.member?.is_active ? "Aktiv" : "Ingen access"}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[#faf7f1] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
                      Roll
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2937]">
                      {state.member?.is_admin ? "Admin" : state.member ? "Medlem" : "Ingen"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] bg-[#faf7f1] px-4 py-4">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#8b7460]">
                    Konto
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#1f2937]">
                    {state.member ? (
                      <>
                        <div className="font-semibold">{state.member.name}</div>
                        <div>{state.member.email}</div>
                      </>
                    ) : state.isLoggedIn ? (
                      "Du är inloggad men är ännu inte upplagd som aktiv SFVOF-medlem."
                    ) : (
                      "Du är inte inloggad."
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-[26px] border border-[#d8d2c7] bg-white/80 p-5 shadow-[0_10px_24px_rgba(18,35,28,0.06)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#7a6540]">
                      Mina registreringar
                    </div>
                    <h2 className="mt-1 text-[1.35rem] font-bold text-[#1f2937]">
                      {state.measurements.length} st
                    </h2>
                  </div>
                </div>

                {state.measurements.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-[#6b7280]">
                    Inga SFVOF-registreringar hittades för det här kontot ännu.
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {state.measurements.map((measurement) => (
                      <MeasurementCard key={measurement.id} measurement={measurement} />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
