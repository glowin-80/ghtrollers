export type CatchAchievement = {
  id: string;
  title: string;
  minCount: number;
  maxCount: number | null;
  badgeImageUrl: string;
  description: string;
};

export const catchAchievements: CatchAchievement[] = [
  {
    id: "fiskesugen",
    title: "Fiskesugen",
    minCount: 0,
    maxCount: 19,
    badgeImageUrl: "/Achievments/catch/catchBadge_1.png",
    description:
      "Du är igång. Kaffet är varmt, draglådan halvöppen och jakten har börjat.",
  },
  {
    id: "fiskarn",
    title: "Fiskarn",
    minCount: 20,
    maxCount: 49,
    badgeImageUrl: "/Achievments/catch/catchBadge_2.png",
    description:
      "Nu börjar det synas att du inte bara är ute och luftar båten.",
  },
  {
    id: "storfiskarn",
    title: "Storfiskarn",
    minCount: 50,
    maxCount: 99,
    badgeImageUrl: "/Achievments/catch/catchBadge_3.png",
    description:
      "Du hittar fisk oftare än andra hittar sina beteslådor.",
  },
  {
    id: "fangstjagaren",
    title: "Fångstjägaren",
    minCount: 100,
    maxCount: 199,
    badgeImageUrl: "/Achievments/catch/catchBadge_4.png",
    description:
      "Du jagar inte tur. Du jagar rätt vatten, rätt tid och rätt hugg.",
  },
  {
    id: "sjoveteranen",
    title: "Sjöveteranen",
    minCount: 200,
    maxCount: 399,
    badgeImageUrl: "/Achievments/catch/catchBadge_5.png",
    description:
      "Nu luktar det erfarenhet, våtdräkt och gamla segrar.",
  },
  {
    id: "masterfiskarn",
    title: "Mästerfiskarn",
    minCount: 400,
    maxCount: 699,
    badgeImageUrl: "/Achievments/catch/catchBadge_6.png",
    description:
      "Du har varit med så länge att fisken nästan känner igen dig.",
  },
  {
    id: "fangstlegend",
    title: "Fångstlegend",
    minCount: 700,
    maxCount: 999,
    badgeImageUrl: "/Achievments/catch/catchBadge_7.png",
    description:
      "En nivå där historierna blir större, men fångsterna fortfarande backar upp dem.",
  },
  {
    id: "gaddhangsikon",
    title: "Gäddhängsikon",
    minCount: 1000,
    maxCount: null,
    badgeImageUrl: "/Achievments/catch/catchBadge_8.png",
    description:
      "Det här är inte längre bara fiske. Det här är Gäddhäng-historia.",
  },
];

export function getCatchAchievement(catchCount: number): CatchAchievement {
  for (let index = catchAchievements.length - 1; index >= 0; index -= 1) {
    const achievement = catchAchievements[index];
    if (catchCount >= achievement.minCount) {
      return achievement;
    }
  }

  return catchAchievements[0];
}

export function getNextCatchAchievement(catchCount: number): CatchAchievement | null {
  return catchAchievements.find((achievement) => catchCount < achievement.minCount) ?? null;
}

export function getRemainingCatchesToNextAchievement(catchCount: number): number {
  const nextAchievement = getNextCatchAchievement(catchCount);
  if (!nextAchievement) {
    return 0;
  }

  return Math.max(nextAchievement.minCount - catchCount, 0);
}

export function hasUnlockedCatchAchievement(catchCount: number, achievement: CatchAchievement): boolean {
  return catchCount >= achievement.minCount;
}
