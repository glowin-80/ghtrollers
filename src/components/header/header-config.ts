export type NavItem = {
  id: string;
  label?: string;
  section?: string;
  href?: string;
  alt: string;
  type: "section" | "route" | "action";
};

export const desktopGraphicItems: NavItem[] = [
  {
    id: "leaderboard",
    label: "Leaderboard",
    section: "leaderboard-section",
    alt: "Leaderboard",
    type: "section",
  },
  {
    id: "upload",
    label: "Ladda upp fångst",
    section: "upload-section",
    alt: "Ladda upp fångst",
    type: "section",
  },
  {
    id: "gallery",
    label: "Galleri",
    href: "/galleri",
    alt: "Galleri",
    type: "route",
  },
  {
    id: "achievements",
    label: "Achievements",
    href: "/achievements",
    alt: "Achievements",
    type: "route",
  },
  {
    id: "map",
    label: "Karta",
    section: "map-section",
    alt: "Karta",
    type: "section",
  },
  {
    id: "markera-fiskeplats",
    label: "Markera fiskeplats",
    href: "/markera-fiskeplats",
    alt: "Markera fiskeplats",
    type: "route",
  },
];

export const mobileMenuItems: NavItem[] = [
  {
    id: "home",
    label: "Startsida",
    href: "/",
    alt: "Startsida",
    type: "route",
  },
  {
    id: "upload",
    label: "Ladda upp fångst",
    section: "upload-section",
    alt: "Ladda upp fångst",
    type: "section",
  },
  {
    id: "leaderboard",
    label: "Leaderboard",
    section: "leaderboard-section",
    alt: "Leaderboard",
    type: "section",
  },
  {
    id: "all-time-high",
    label: "All-time-high",
    href: "/all-time-high",
    alt: "All-time-high",
    type: "route",
  },
  {
    id: "gallery",
    label: "Galleri",
    href: "/galleri",
    alt: "Galleri",
    type: "route",
  },
  {
    id: "achievements",
    label: "Achievements",
    href: "/achievements",
    alt: "Achievements",
    type: "route",
  },
  {
    id: "map",
    label: "Karta",
    section: "map-section",
    alt: "Karta",
    type: "section",
  },
  {
    id: "markera-fiskeplats",
    label: "Markera fiskeplats",
    href: "/markera-fiskeplats",
    alt: "Markera fiskeplats",
    type: "route",
  },
];

export function getMobileCardTheme(itemId: string) {
  switch (itemId) {
    case "home":
      return {
        outer:
          "border-[#c6ab68] bg-[linear-gradient(180deg,#f7edd9_0%,#e9dbbd_100%)] text-[#342719]",
        iconCircle:
          "bg-[linear-gradient(180deg,#fff7e6_0%,#efdfbf_100%)] text-[#6a5230]",
        arrow: "text-[#6a5230]",
      };
    case "leaderboard":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#3f6079_0%,#28435a_100%)] text-[#f5e6bf]",
        iconCircle:
          "bg-[linear-gradient(180deg,#5b7a96_0%,#38546b_100%)] text-[#f4ddab]",
        arrow: "text-[#f4ddab]",
      };
    case "upload":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#536a40_0%,#344628_100%)] text-[#f3e2b6]",
        iconCircle:
          "bg-[linear-gradient(180deg,#6a8254_0%,#455c34_100%)] text-[#f1dca7]",
        arrow: "text-[#f1dca7]",
      };
    case "gallery":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#8a6237_0%,#65431f_100%)] text-[#f6e5c0]",
        iconCircle:
          "bg-[linear-gradient(180deg,#a17849_0%,#784f28_100%)] text-[#f0d8a8]",
        arrow: "text-[#f0d8a8]",
      };
    case "achievements":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#6d5941_0%,#4e3c27_100%)] text-[#f5e4bc]",
        iconCircle:
          "bg-[linear-gradient(180deg,#8a7252_0%,#674d33_100%)] text-[#f1dca7]",
        arrow: "text-[#f1dca7]",
      };
    case "map":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#5c837f_0%,#3d615d_100%)] text-[#f2e1b9]",
        iconCircle:
          "bg-[linear-gradient(180deg,#78a09a_0%,#537874_100%)] text-[#efdbab]",
        arrow: "text-[#efdbab]",
      };
    case "all-time-high":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#8b6aac_0%,#6d4f8f_100%)] text-[#f6e8c8]",
        iconCircle:
          "bg-[linear-gradient(180deg,#9d80bc_0%,#7b5c9c_100%)] text-[#f0ddb1]",
        arrow: "text-[#f0ddb1]",
      };
    case "markera-fiskeplats":
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#5f6f8f_0%,#42526f_100%)] text-[#f3e5c1]",
        iconCircle:
          "bg-[linear-gradient(180deg,#7b8aa8_0%,#596882_100%)] text-[#f0ddb1]",
        arrow: "text-[#f0ddb1]",
      };
    default:
      return {
        outer:
          "border-[#c3a766] bg-[linear-gradient(180deg,#f6eee0_0%,#e8dbc3_100%)] text-[#3c2f22]",
        iconCircle:
          "bg-[linear-gradient(180deg,#fff8eb_0%,#eee0c6_100%)] text-[#654f31]",
        arrow: "text-[#654f31]",
      };
  }
}
