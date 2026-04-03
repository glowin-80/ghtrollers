import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import Header from "../components/Header";
import AppProviders from "@/components/providers/AppProviders";

export const metadata: Metadata = {
  title: "Gäddhäng Trollers",
  description: "PWA för Gäddhäng Trollers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="bg-[#e5dccd] text-gray-900">
        <div className="relative min-h-screen">
          <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
              background: `
                linear-gradient(
                  90deg,
                  rgba(229,220,205,0.92) 0%,
                  rgba(229,220,205,0.62) 14%,
                  rgba(229,220,205,0.18) 28%,
                  rgba(229,220,205,0.00) 42%,
                  rgba(229,220,205,0.00) 58%,
                  rgba(229,220,205,0.18) 72%,
                  rgba(229,220,205,0.62) 86%,
                  rgba(229,220,205,0.92) 100%
                ),
                radial-gradient(
                  ellipse at center,
                  rgba(255,255,255,0.00) 52%,
                  rgba(229,220,205,0.20) 78%,
                  rgba(229,220,205,0.38) 100%
                )
              `,
            }}
          />

          <div className="relative z-10">
            <AppProviders>
              <Header />
              {children}
            </AppProviders>
          </div>
        </div>
      </body>
    </html>
  );
}