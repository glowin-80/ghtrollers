export type AchievementCategoryStatus = "active" | "coming_soon";

export type AchievementCategory = {
  id: string;
  label: string;
  status: AchievementCategoryStatus;
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
    id: "fishing_spots",
    label: "Registrerade fiskeplatser",
    status: "coming_soon",
    description: "Kommer snart.",
  },
  {
    id: "waters",
    label: "Fiskade vatten",
    status: "coming_soon",
    description: "Kommer snart.",
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

export const activeAchievementDefinitions: AchievementDefinition[] = [
  ...reportedCatchAchievements,
];

export function getAchievementCategory(categoryId: string) {
  return achievementCategories.find((category) => category.id === categoryId) ?? null;
}

export function getAchievementsForCategory(categoryId: string) {
  return activeAchievementDefinitions
    .filter((achievement) => achievement.categoryId === categoryId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCurrentAchievementByValue(value: number, categoryId = "reported_catches") {
  if (categoryId === "reported_catches" && value <= 0) {
    return reportedCatchBaselineAchievement;
  }

  const achievements = getAchievementsForCategory(categoryId);

  return (
    achievements.find((achievement) => {
      const withinMin = value >= achievement.minValue;
      const withinMax = achievement.maxValue === null || value <= achievement.maxValue;
      return withinMin && withinMax;
    }) ?? achievements[0] ?? null
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
    progressLabel: formatAchievementRange(achievement.minValue, achievement.maxValue),
  }));
}

export function formatAchievementRange(minValue: number, maxValue: number | null) {
  if (maxValue === null) {
    return `${minValue}+ fångster`;
  }

  return `${minValue}–${maxValue} fångster`;
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

export function getAllUnlockedAchievements(params: { catchCount: number }) {
  return [
    ...getUnlockedAchievementsByValue(params.catchCount, "reported_catches"),
  ].sort((a, b) => b.sortOrder - a.sortOrder);
}