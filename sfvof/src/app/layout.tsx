import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SFVOF",
  description: "Isolerad SFVOF-del för gösregistrering",
};

export default function SfvofLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
