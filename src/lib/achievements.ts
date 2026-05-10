export type AchievementCategoryStatus = "active" | "coming_soon";

export type AchievementCategory = {
  id: string;
  label: string;
  status: AchievementCategoryStatus;
  comingSoonLabel?: string;
  description: string;
};

export type AchievementDefinition = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  minValue: number;
  maxValue: number | null;
  imageSrc: string;
  sortOrder: number;
};

export type ResolvedAchievement = AchievementDefinition & {
  unlocked: boolean;
  current: boolean;
  progressLabel: string;
};

export const achievementCategories: AchievementCategory[] = [
  {
    id: "reported_catches",
    label: "Rapporterad Fångst",
    status: "active",
    description:
      "En helt egen kategori för lite humor, progression och viljan att rapportera fler fångster — även när de inte avgör tävlingen.",
  },
  {
    id: "waters",
    label: "Fiskade vatten",
    status: "active",
    description:
      "Här räknas hur många olika vatten du har fångster från. Samma sjö räknas bara en gång, även om du rapporterat flera fångster där. Endast fångster med GPS-hämtad eller kartvald plats räknas; fångster med fritextplats räknas inte.",
  },
  {
    id: "fishing_spots",
    label: "Registrerade fiskeplatser",
    status: "active",
    description:
      "Bidra med fina fiskeplatser åt dina fina Gäddhängare. Endast godkända offentliga fiskeplatser från Markera fiskeplats räknas.",
  },
  {
    id: "species",
    label: "Fångade arter",
    status: "coming_soon",
    description: "Kommer snart.",
  },
  {
    id: "streaks",
    label: "Streaks & bragder",
    status: "coming_soon",
    description: "Kommer snart.",
  },
];

export const reportedCatchBaselineAchievement: AchievementDefinition = {
  id: "catch_00",
  categoryId: "reported_catches",
  title: "Nyfiken",
  description:
    "Du har inte rapporterat någon fångst ännu, men blicken är redan riktad mot vattnet.",
  minValue: 0,
  maxValue: 0,
  imageSrc: "/Achievments/catch/catchBadge_0.svg",
  sortOrder: 0,
};

export const reportedCatchAchievements: AchievementDefinition[] = [
  {
    id: "catch_01",
    categoryId: "reported_catches",
    title: "Fiskesugen",
    description:
      "Du är igång. Kaffet är varmt, draglådan halvöppen och jakten har börjat.",
    minValue: 1,
    maxValue: 19,
    imageSrc: "/Achievments/catch/catchBadge_1.png",
    sortOrder: 1,
  },
  {
    id: "catch_02",
    categoryId: "reported_catches",
    title: "Fiskarn",
    description:
      "Nu börjar det synas att du inte bara är ute och luftar båten.",
    minValue: 20,
    maxValue: 49,
    imageSrc: "/Achievments/catch/catchBadge_2.png",
    sortOrder: 2,
  },
  {
    id: "catch_03",
    categoryId: "reported_catches",
    title: "Storfiskarn",
    description:
      "Du hittar fisk oftare än andra hittar sina beteslådor.",
    minValue: 50,
    maxValue: 99,
    imageSrc: "/Achievments/catch/catchBadge_3.png",
    sortOrder: 3,
  },
  {
    id: "catch_04",
    categoryId: "reported_catches",
    title: "Fångstjägaren",
    description:
      "Du jagar inte tur. Du jagar rätt vatten, rätt tid och rätt hugg.",
    minValue: 100,
    maxValue: 199,
    imageSrc: "/Achievments/catch/catchBadge_4.png",
    sortOrder: 4,
  },
  {
    id: "catch_05",
    categoryId: "reported_catches",
    title: "Sjöveteranen",
    description: "Nu luktar det erfarenhet, våtdräkt och gamla segrar.",
    minValue: 200,
    maxValue: 399,
    imageSrc: "/Achievments/catch/catchBadge_5.png",
    sortOrder: 5,
  },
  {
    id: "catch_06",
    categoryId: "reported_catches",
    title: "Mästerfiskarn",
    description:
      "Du har varit med så länge att fisken nästan känner igen dig.",
    minValue: 400,
    maxValue: 699,
    imageSrc: "/Achievments/catch/catchBadge_6.png",
    sortOrder: 6,
  },
  {
    id: "catch_07",
    categoryId: "reported_catches",
    title: "Fångstlegend",
    description:
      "En nivå där historierna blir större, men fångsterna fortfarande backar upp dem.",
    minValue: 700,
    maxValue: 999,
    imageSrc: "/Achievments/catch/catchBadge_7.png",
    sortOrder: 7,
  },
  {
    id: "catch_08",
    categoryId: "reported_catches",
    title: "Gäddhängsikon",
    description:
      "Det här är inte längre bara fiske. Det här är Gäddhäng-historia.",
    minValue: 1000,
    maxValue: null,
    imageSrc: "/Achievments/catch/catchBadge_8.png",
    sortOrder: 8,
  },
];

export const waterBaselineAchievement: AchievementDefinition = {
  id: "water_00",
  categoryId: "waters",
  title: "Strandspanare",
  description:
    "Du har inte fiskat något vatten ännu, men kartan är redan uppslagen och första platsen väntar.",
  minValue: 0,
  maxValue: 0,
  imageSrc: "/Achievments/catch/catchBadge_0.svg",
  sortOrder: 0,
};

export const waterAchievements: AchievementDefinition[] = [
  {
    id: "water_01",
    categoryId: "waters",
    title: "Första kastet",
    description: "Ett vatten är avklarat. Nu vet du att kartan har fler historier att bjuda på.",
    minValue: 1,
    maxValue: 1,
    imageSrc: "/Achievments/waters/waterBadge_1.png",
    sortOrder: 1,
  },
  {
    id: "water_02",
    categoryId: "waters",
    title: "Vattenletare",
    description: "Du börjar lämna det gamla vanliga bakom dig och testar vatten med nyfiken blick.",
    minValue: 2,
    maxValue: 5,
    imageSrc: "/Achievments/waters/waterBadge_2.png",
    sortOrder: 2,
  },
  {
    id: "water_03",
    categoryId: "waters",
    title: "Sjövandrare",
    description: "Du rör dig mellan sjöar, vikar och vatten. Stövlarna får jobba och kartan får nya märken.",
    minValue: 6,
    maxValue: 10,
    imageSrc: "/Achievments/waters/waterBadge_3.png",
    sortOrder: 3,
  },
  {
    id: "water_04",
    categoryId: "waters",
    title: "Kartfiskare",
    description: "Du chansar inte bara längre. Du planerar, jämför och hittar nya vatten med mening.",
    minValue: 11,
    maxValue: 16,
    imageSrc: "/Achievments/waters/waterBadge_4.png",
    sortOrder: 4,
  },
  {
    id: "water_05",
    categoryId: "waters",
    title: "Vattenjägare",
    description: "Du jagar inte bara fisk längre. Du jagar nästa vatten, nästa chans och nästa berättelse.",
    minValue: 17,
    maxValue: 25,
    imageSrc: "/Achievments/waters/waterBadge_5.png",
    sortOrder: 5,
  },
  {
    id: "water_06",
    categoryId: "waters",
    title: "Sjökännare",
    description: "Du har varit runt. När andra ser blått på kartan ser du möjligheter, djup och gamla hugg.",
    minValue: 26,
    maxValue: 35,
    imageSrc: "/Achievments/waters/waterBadge_6.png",
    sortOrder: 6,
  },
  {
    id: "water_07",
    categoryId: "waters",
    title: "Vattenmästare",
    description: "Du fiskar inte bara i många vatten. Du börjar förstå hur olika de faktiskt är.",
    minValue: 36,
    maxValue: 49,
    imageSrc: "/Achievments/waters/waterBadge_7.png",
    sortOrder: 7,
  },
  {
    id: "water_08",
    categoryId: "waters",
    title: "Gäddhängsnavigator",
    description: "Du har sett mer vatten än de flesta ens hinner prata om. Det här är ren upptäckarglädje.",
    minValue: 50,
    maxValue: null,
    imageSrc: "/Achievments/waters/waterBadge_8.png",
    sortOrder: 8,
  },
];

export const fishingSpotBaselineAchievement: AchievementDefinition = {
  id: "fishing_spot_00",
  categoryId: "fishing_spots",
  title: "Kartlös",
  description:
    "Du har inte registrerat någon godkänd offentlig fiskeplats ännu, men kartan väntar på ditt första bidrag.",
  minValue: 0,
  maxValue: 0,
  imageSrc: "/Achievments/catch/catchBadge_0.svg",
  sortOrder: 0,
};

export const fishingSpotAchievements: AchievementDefinition[] = [
  {
    id: "fishing_spot_01",
    categoryId: "fishing_spots",
    title: "Platsletare",
    description:
      "Du har bidragit med din första godkända offentliga fiskeplats till Gäddhäng-kartan.",
    minValue: 1,
    maxValue: 4,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_1.svg",
    sortOrder: 1,
  },
  {
    id: "fishing_spot_02",
    categoryId: "fishing_spots",
    title: "Gäddhängsnavigator",
    description:
      "Du börjar visa vägen. Fina platser hittar in på kartan tack vare dig.",
    minValue: 5,
    maxValue: 9,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_2.svg",
    sortOrder: 2,
  },
  {
    id: "fishing_spot_03",
    categoryId: "fishing_spots",
    title: "Vattenvägvisare",
    description:
      "Du hjälper dina fina Gäddhängare att hitta fler vatten, fler lägen och fler chanser.",
    minValue: 10,
    maxValue: 24,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_3.svg",
    sortOrder: 3,
  },
  {
    id: "fishing_spot_04",
    categoryId: "fishing_spots",
    title: "Fiskeplatsjägare",
    description:
      "Du jagar inte bara fisk längre. Du jagar platser som gör hela kartan bättre.",
    minValue: 25,
    maxValue: 49,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_4.svg",
    sortOrder: 4,
  },
  {
    id: "fishing_spot_05",
    categoryId: "fishing_spots",
    title: "Sjökännare",
    description:
      "Du har koll på fler vatten än de flesta och delar med dig av platser som lyfter Gäddhäng.",
    minValue: 50,
    maxValue: 99,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_5.svg",
    sortOrder: 5,
  },
  {
    id: "fishing_spot_06",
    categoryId: "fishing_spots",
    title: "Kartmästare",
    description:
      "Nu är du en av dem som verkligen bygger kartan. Dina bidrag gör skillnad för hela gänget.",
    minValue: 100,
    maxValue: 199,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_6.svg",
    sortOrder: 6,
  },
  {
    id: "fishing_spot_07",
    categoryId: "fishing_spots",
    title: "Gäddhängsguide",
    description:
      "Det här är kartbidrag på legendarisk nivå. Dina fina Gäddhängare har mycket att tacka dig för.",
    minValue: 200,
    maxValue: null,
    imageSrc: "/Achievments/fishing-spots/fishingSpotBadge_7.svg",
    sortOrder: 7,
  },
];

export const achievementDefinitions: AchievementDefinition[] = [
  ...reportedCatchAchievements,
  ...waterAchievements,
  ...fishingSpotAchievements,
];

export const activeAchievementDefinitions: AchievementDefinition[] = [
  ...reportedCatchAchievements,
  ...waterAchievements,
  ...fishingSpotAchievements,
];

export function getAchievementCategory(categoryId: string) {
  return achievementCategories.find((category) => category.id === categoryId) ?? null;
}

export function getAchievementsForCategory(categoryId: string) {
  return achievementDefinitions
    .filter((achievement) => achievement.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCurrentAchievementByValue(value: number, categoryId = "reported_catches") {
  if (categoryId === "reported_catches" && value <= 0) {
    return reportedCatchBaselineAchievement;
  }

  if (categoryId === "waters" && value <= 0) {
    return waterBaselineAchievement;
  }

  if (categoryId === "fishing_spots" && value <= 0) {
    return fishingSpotBaselineAchievement;
  }

  const achievements = getAchievementsForCategory(categoryId);

  return (
    achievements.find((achievement) => {
      const withinMin = value >= achievement.minValue;
      const withinMax = achievement.maxValue === null || value <= achievement.maxValue;
      return withinMin && withinMax;
    }) ?? null
  );
}

export function getNextAchievementByValue(value: number, categoryId = "reported_catches") {
  const achievements = getAchievementsForCategory(categoryId);
  return achievements.find((achievement) => achievement.minValue > value) ?? null;
}

export function getUnlockedAchievementsByValue(value: number, categoryId = "reported_catches") {
  return getAchievementsForCategory(categoryId).filter((achievement) => value >= achievement.minValue);
}

export function getNewlyUnlockedAchievementByValue(
  beforeValue: number,
  afterValue: number,
  categoryId = "reported_catches"
) {
  if (afterValue <= beforeValue) {
    return null;
  }

  const category = getAchievementCategory(categoryId);

  if (category?.status !== "active") {
    return null;
  }

  const newlyUnlockedAchievements = getAchievementsForCategory(categoryId).filter(
    (achievement) => achievement.minValue > beforeValue && achievement.minValue <= afterValue
  );

  return newlyUnlockedAchievements.at(-1) ?? null;
}

export function getResolvedAchievementsByValue(
  value: number,
  categoryId = "reported_catches"
): ResolvedAchievement[] {
  const current = getCurrentAchievementByValue(value, categoryId);

  return getAchievementsForCategory(categoryId).map((achievement) => ({
    ...achievement,
    unlocked: value >= achievement.minValue,
    current: current?.id === achievement.id,
    progressLabel: formatAchievementRange(achievement.minValue, achievement.maxValue, categoryId),
  }));
}

export function getAchievementUnitLabel(categoryId = "reported_catches") {
  switch (categoryId) {
    case "waters":
      return "vatten";
    case "fishing_spots":
      return "fiskeplatser";
    case "reported_catches":
    default:
      return "fångster";
  }
}

export function formatAchievementRange(
  minValue: number,
  maxValue: number | null,
  categoryId = "reported_catches"
) {
  const unit = getAchievementUnitLabel(categoryId);

  if (maxValue === null) {
    return `${minValue}+ ${unit}`;
  }

  if (minValue === maxValue) {
    return `${minValue} ${unit}`;
  }

  return `${minValue}–${maxValue} ${unit}`;
}

export function getRemainingToNextAchievement(value: number, categoryId = "reported_catches") {
  const next = getNextAchievementByValue(value, categoryId);

  if (!next) {
    return null;
  }

  return {
    title: next.title,
    remaining: Math.max(next.minValue - value, 0),
  };
}

export function getAchievementProgressValue(params: {
  categoryId: string;
  catchCount: number;
  uniqueWaterCount: number;
  fishingSpotCount?: number;
}) {
  switch (params.categoryId) {
    case "waters":
      return params.uniqueWaterCount;
    case "fishing_spots":
      return params.fishingSpotCount ?? 0;
    case "reported_catches":
    default:
      return params.catchCount;
  }
}

export function getAllUnlockedAchievements(params: {
  catchCount: number;
  uniqueWaterCount: number;
  fishingSpotCount?: number;
}) {
  return [
    ...getUnlockedAchievementsByValue(params.catchCount, "reported_catches"),
    ...getUnlockedAchievementsByValue(params.uniqueWaterCount, "waters"),
    ...getUnlockedAchievementsByValue(params.fishingSpotCount ?? 0, "fishing_spots"),
  ].sort((a, b) => {
    if (b.sortOrder !== a.sortOrder) {
      return b.sortOrder - a.sortOrder;
    }

    return a.categoryId.localeCompare(b.categoryId, "sv");
  });
}