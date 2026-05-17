import { NextResponse } from "next/server";
import { getUnlockedAchievementDefinitionsForBackfill, recordAchievementUnlocks } from "@/lib/achievement-unlocks";
import {
  createPushServiceRoleSupabaseClient,
  getAuthenticatedPushMemberContext,
} from "@/lib/push-notification-server";

export const runtime = "nodejs";

type MemberRow = {
  id: string;
  name: string | null;
  is_active: boolean | null;
};

type CatchRow = {
  id: string;
  caught_for: string | null;
  caught_for_member_id: string | null;
  status: string | null;
  water_name: string | null;
  water_key: string | null;
  created_at: string | null;
};

type FishingSpotRow = {
  id: string;
  created_by_member_id: string | null;
  status: string | null;
  is_private: boolean | null;
  approved_at: string | null;
  created_at: string | null;
};

function normalizeName(value: string | null | undefined) {
  return value?.trim().toLocaleLowerCase("sv-SE") ?? "";
}

function normalizeWaterName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}

function getWaterKey(catchItem: CatchRow) {
  const waterKey = catchItem.water_key?.trim();
  if (waterKey) return `key:${waterKey}`;

  const waterName = catchItem.water_name ? normalizeWaterName(catchItem.water_name) : "";
  if (waterName) return `name:${waterName}`;

  return null;
}

function sortByCreatedAt<T extends { created_at: string | null }>(items: T[]) {
  return [...items].sort((a, b) => {
    const left = a.created_at ? new Date(a.created_at).getTime() : 0;
    const right = b.created_at ? new Date(b.created_at).getTime() : 0;
    return left - right;
  });
}

function getThresholdDate<T extends { created_at: string | null }>(items: T[], threshold: number) {
  if (threshold <= 0) return null;
  return sortByCreatedAt(items)[threshold - 1]?.created_at ?? null;
}

function getUniqueWaterThresholdDate(catches: CatchRow[], threshold: number) {
  if (threshold <= 0) return null;

  const seen = new Set<string>();

  for (const catchItem of sortByCreatedAt(catches)) {
    const key = getWaterKey(catchItem);
    if (!key || seen.has(key)) continue;

    seen.add(key);

    if (seen.size >= threshold) {
      return catchItem.created_at;
    }
  }

  return null;
}

function getFishingSpotThresholdDate(spots: FishingSpotRow[], threshold: number) {
  if (threshold <= 0) return null;

  const sorted = [...spots].sort((a, b) => {
    const left = new Date(a.approved_at ?? a.created_at ?? 0).getTime();
    const right = new Date(b.approved_at ?? b.created_at ?? 0).getTime();
    return left - right;
  });

  const spot = sorted[threshold - 1];
  return spot?.approved_at ?? spot?.created_at ?? null;
}

export async function POST(request: Request) {
  const context = await getAuthenticatedPushMemberContext(request);

  if (!context) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!context.member?.is_active || !context.member.is_super_admin) {
    return NextResponse.json(
      { error: "Only Super admin can backfill achievement unlocks." },
      { status: 403 }
    );
  }

  const serviceSupabase = createPushServiceRoleSupabaseClient();

  if (!serviceSupabase) {
    return NextResponse.json(
      { error: "Service role key is not configured." },
      { status: 500 }
    );
  }

  const [{ data: membersData, error: membersError }, { data: catchesData, error: catchesError }, { data: spotsData, error: spotsError }] =
    await Promise.all([
      serviceSupabase.from("members").select("id, name, is_active").eq("is_active", true),
      serviceSupabase
        .from("catches")
        .select("id, caught_for, caught_for_member_id, status, water_name, water_key, created_at")
        .eq("status", "approved"),
      serviceSupabase
        .from("fishing_spots")
        .select("id, created_by_member_id, status, is_private, approved_at, created_at")
        .eq("status", "approved")
        .or("is_private.is.false,is_private.is.null"),
    ]);

  if (membersError) return NextResponse.json({ error: "Could not read members." }, { status: 500 });
  if (catchesError) return NextResponse.json({ error: "Could not read catches." }, { status: 500 });
  if (spotsError) return NextResponse.json({ error: "Could not read fishing spots." }, { status: 500 });

  const members = (membersData ?? []) as MemberRow[];
  const catches = (catchesData ?? []) as CatchRow[];
  const spots = (spotsData ?? []) as FishingSpotRow[];

  let insertedCount = 0;
  let duplicateCount = 0;

  for (const member of members) {
    const memberName = normalizeName(member.name);
    const memberCatches = catches.filter((catchItem) => {
      if (catchItem.caught_for_member_id === member.id) return true;
      return memberName.length > 0 && normalizeName(catchItem.caught_for) === memberName;
    });
    const memberWaterCatches = memberCatches.filter((catchItem) => getWaterKey(catchItem));
    const memberSpots = spots.filter((spot) => spot.created_by_member_id === member.id);

    const categories = [
      {
        id: "reported_catches",
        value: memberCatches.length,
        dateForThreshold: (threshold: number) => getThresholdDate(memberCatches, threshold),
        sourceTable: "catches",
      },
      {
        id: "waters",
        value: new Set(memberWaterCatches.map(getWaterKey).filter(Boolean)).size,
        dateForThreshold: (threshold: number) => getUniqueWaterThresholdDate(memberWaterCatches, threshold),
        sourceTable: "catches",
      },
      {
        id: "fishing_spots",
        value: memberSpots.length,
        dateForThreshold: (threshold: number) => getFishingSpotThresholdDate(memberSpots, threshold),
        sourceTable: "fishing_spots",
      },
    ];

    for (const category of categories) {
      const unlocked = getUnlockedAchievementDefinitionsForBackfill({
        categoryId: category.id,
        value: category.value,
      });

      for (const achievement of unlocked) {
        const results = await recordAchievementUnlocks(serviceSupabase, {
          memberId: member.id,
          achievements: [achievement],
          unlockedAt: category.dateForThreshold(achievement.minValue),
          source: "backfill",
          sourceTable: category.sourceTable,
        });

        if (results[0]?.inserted) insertedCount += 1;
        if (results[0]?.duplicate) duplicateCount += 1;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    insertedCount,
    duplicateCount,
    memberCount: members.length,
  });
}
