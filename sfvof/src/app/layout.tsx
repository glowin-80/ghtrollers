import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storsjöns FVOF Sandviken",
  description: "Separat informations- och inloggningssida för Storsjöns FVOF Sandviken.",
};

export default function SfvofLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
