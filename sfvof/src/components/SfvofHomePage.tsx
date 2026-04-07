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
    <article className="rounded-[24px] border border-[#d7dfdc] bg-white p-4 shadow-[0_8px_22px_rgba(18,35,28,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#5c6f69]">
            {measurement.length_interval_label}
          </div>
          <h3 className="mt-1 text-[1.2rem] font-bold text-[#1f2f2a]">
            {measurement.fish_length_cm} cm
          </h3>
        </div>

        <div className="rounded-full border border-[#d7dfdc] bg-[#f3f7f6] px-3 py-1 text-[0.78rem] font-semibold text-[#46615a]">
          {measurement.is_approved ? "Sparad" : "Ej godkänd"}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#4c5f59] sm:grid-cols-2">
        <div className="rounded-[18px] bg-[#f6faf8] px-3 py-2.5">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
            Mätt
          </dt>
          <dd className="mt-1 font-medium text-[#1f2f2a]">
            {formatMeasuredAt(measurement.measured_at)}
          </dd>
        </div>

        <div className="rounded-[18px] bg-[#f6faf8] px-3 py-2.5">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
            Registrerad av
          </dt>
          <dd className="mt-1 font-medium text-[#1f2f2a]">
            {measurement.registered_by_name}
          </dd>
        </div>

        <div className="rounded-[18px] bg-[#f6faf8] px-3 py-2.5 sm:col-span-2">
          <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
            GPS
          </dt>
          <dd className="mt-1 font-medium text-[#1f2f2a]">
            {formatCoordinate(measurement.gps_lat)}, {formatCoordinate(measurement.gps_lng)}
          </dd>
        </div>

        {measurement.comment ? (
          <div className="rounded-[18px] bg-[#f6faf8] px-3 py-2.5 sm:col-span-2">
            <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
              Kommentar
            </dt>
            <dd className="mt-1 font-medium text-[#1f2f2a]">{measurement.comment}</dd>
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
    <main className="px-4 pb-10 pt-6 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <section className="rounded-[30px] border border-[#d7dfdc] bg-white p-5 shadow-[0_12px_30px_rgba(18,35,28,0.06)] sm:p-6">
          <div className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#5c6f69]">
            Översikt
          </div>
          <h2 className="mt-2 text-[1.8rem] font-bold leading-none text-[#1f2f2a] sm:text-[2.05rem]">
            Första isolerade SFVOF-sidan
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#58706a]">
            Den här sidan är nu frikopplad visuellt från Gäddhäng Trollers. Ingen
            Gäddhäng-header eller meny visas här, och sidan läser bara data från
            schema <span className="font-semibold text-[#2f4a43]">sfvof</span>.
          </p>
        </section>

        <div className="mt-6 space-y-6">
          {state.status === "loading" ? (
            <section className="rounded-[26px] border border-[#d7dfdc] bg-white p-5 text-sm text-[#4c5f59] shadow-[0_10px_24px_rgba(18,35,28,0.05)]">
              Läser SFVOF-data...
            </section>
          ) : null}

          {state.status === "error" ? (
            <section className="rounded-[26px] border border-[#d7dfdc] bg-white p-5 shadow-[0_10px_24px_rgba(18,35,28,0.05)]">
              <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#5c6f69]">
                Fel
              </div>
              <p className="mt-2 text-sm leading-6 text-[#4c5f59]">{state.message}</p>
            </section>
          ) : null}

          {state.status === "ready" ? (
            <>
              <section className="rounded-[26px] border border-[#d7dfdc] bg-white p-5 shadow-[0_10px_24px_rgba(18,35,28,0.05)]">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[20px] bg-[#f6faf8] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
                      Inloggad
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2f2a]">
                      {state.isLoggedIn ? "Ja" : "Nej"}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[#f6faf8] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
                      SFVOF-medlem
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2f2a]">
                      {state.member?.is_active ? "Aktiv" : "Ingen access"}
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-[#f6faf8] px-4 py-4">
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
                      Roll
                    </div>
                    <div className="mt-2 text-[1rem] font-semibold text-[#1f2f2a]">
                      {state.member?.is_admin ? "Admin" : state.member ? "Medlem" : "Ingen"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] bg-[#f6faf8] px-4 py-4">
                  <div className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#748983]">
                    Konto
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#1f2f2a]">
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

              <section className="rounded-[26px] border border-[#d7dfdc] bg-white p-5 shadow-[0_10px_24px_rgba(18,35,28,0.05)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#5c6f69]">
                      Mina registreringar
                    </div>
                    <h2 className="mt-1 text-[1.35rem] font-bold text-[#1f2f2a]">
                      {state.measurements.length} st
                    </h2>
                  </div>
                </div>

                {state.measurements.length === 0 ? (
                  <p className="mt-4 text-sm leading-6 text-[#58706a]">
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
