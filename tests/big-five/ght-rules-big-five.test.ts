import { describe, expect, it } from 'vitest';

import { buildBigFiveBreakdownForCatches, getBigFiveScore } from '@/lib/big-five';
import { isCompetitionEligibleCatch } from '@/lib/ght-rules';
import { buildAllTimeBigFiveLeader } from '@/lib/home-bigfive';
import type { Catch, Member } from '@/types/home';

function makeCatch(overrides: Partial<Catch> = {}): Catch {
  return {
    id: overrides.id ?? 'catch-1',
    caught_for: overrides.caught_for ?? 'Anna',
    caught_for_member_id: overrides.caught_for_member_id ?? 'member-anna',
    registered_by: overrides.registered_by ?? overrides.caught_for ?? 'Anna',
    registered_by_member_id:
      overrides.registered_by_member_id ?? overrides.caught_for_member_id ?? 'member-anna',
    fish_type: overrides.fish_type ?? 'Gädda',
    fine_fish_type: overrides.fine_fish_type ?? null,
    weight_g: overrides.weight_g ?? 1000,
    catch_date: overrides.catch_date ?? '2026-01-01',
    location_name: overrides.location_name ?? null,
    image_url: overrides.image_url ?? null,
    latitude: overrides.latitude ?? null,
    longitude: overrides.longitude ?? null,
    fishing_method: overrides.fishing_method ?? null,
    live_scope: overrides.live_scope ?? false,
    caught_abroad: overrides.caught_abroad ?? false,
    is_location_private: overrides.is_location_private ?? false,
    original_image_size_bytes: overrides.original_image_size_bytes ?? null,
    compressed_image_size_bytes: overrides.compressed_image_size_bytes ?? null,
    status: overrides.status ?? 'approved',
    created_at: overrides.created_at ?? '2026-01-01T00:00:00.000Z',
  };
}

const members: Member[] = [
  {
    id: 'member-anna',
    name: 'Anna',
    category: 'senior',
    member_role: 'competition_member',
  },
  {
    id: 'member-bert',
    name: 'Bert',
    category: 'senior',
    member_role: 'competition_member',
  },
  {
    id: 'member-guest',
    name: 'Guesty',
    category: 'senior',
    member_role: 'guest_angler',
  },
];

describe('Big Five and competition rules', () => {
  it('weights Abborre x4 and leaves other fish unchanged', () => {
    expect(getBigFiveScore(makeCatch({ fish_type: 'Abborre', weight_g: 250 }))).toBe(1000);
    expect(getBigFiveScore(makeCatch({ fish_type: 'Gädda', weight_g: 2500 }))).toBe(2500);
  });

  it('builds Big Five from the five highest adjusted catches', () => {
    const catches = [
      makeCatch({ id: 'a', fish_type: 'Gädda', weight_g: 4000 }),
      makeCatch({ id: 'b', fish_type: 'Gädda', weight_g: 3500 }),
      makeCatch({ id: 'c', fish_type: 'Abborre', weight_g: 600 }), // 2400
      makeCatch({ id: 'd', fish_type: 'Gädda', weight_g: 2000 }),
      makeCatch({ id: 'e', fish_type: 'Abborre', weight_g: 500 }), // 2000
      makeCatch({ id: 'f', fish_type: 'Gädda', weight_g: 1500 }),
    ];

    const breakdown = buildBigFiveBreakdownForCatches('Anna', catches);

    expect(breakdown.name).toBe('Anna');
    expect(breakdown.total).toBe(13900);
    expect(breakdown.items.map((item) => item.catchId)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(breakdown.items.find((item) => item.catchId === 'c')).toMatchObject({
      originalWeight: 600,
      adjustedWeight: 2400,
      usesMultiplier: true,
    });
  });

  it('excludes guest angler, Live-scope and abroad catches from competition', () => {
    const catches = [
      makeCatch({ id: 'counted-1', caught_for: 'Anna', caught_for_member_id: 'member-anna' }),
      makeCatch({ id: 'counted-2', caught_for: 'Bert', caught_for_member_id: 'member-bert' }),
      makeCatch({
        id: 'guest',
        caught_for: 'Guesty',
        caught_for_member_id: 'member-guest',
      }),
      makeCatch({ id: 'livescope', live_scope: true }),
      makeCatch({ id: 'abroad', caught_abroad: true }),
    ];

    const eligibleIds = catches
      .filter((catchItem) => isCompetitionEligibleCatch(catchItem, members))
      .map((catchItem) => catchItem.id);

    expect(eligibleIds).toEqual(['counted-1', 'counted-2']);
  });

  it('picks the best all-time Big Five from a single year, not across multiple years', () => {
    const catches = [
      makeCatch({ id: 'bert-2023-a', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 4000, catch_date: '2023-06-01', image_url: 'bert-2023-a.jpg' }),
      makeCatch({ id: 'bert-2023-b', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 3500, catch_date: '2023-06-02' }),
      makeCatch({ id: 'bert-2023-c', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Abborre', weight_g: 700, catch_date: '2023-06-03' }), // 2800
      makeCatch({ id: 'bert-2023-d', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 2500, catch_date: '2023-06-04' }),
      makeCatch({ id: 'bert-2023-e', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 2000, catch_date: '2023-06-05' }),

      makeCatch({ id: 'bert-2024-a', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 5000, catch_date: '2024-06-01', image_url: 'bert-2024-a.jpg' }),
      makeCatch({ id: 'bert-2024-b', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 4500, catch_date: '2024-06-02' }),
      makeCatch({ id: 'bert-2024-c', caught_for: 'Bert', caught_for_member_id: 'member-bert', fish_type: 'Gädda', weight_g: 1000, catch_date: '2024-06-03' }),

      makeCatch({ id: 'anna-2026-a', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 3000, catch_date: '2026-06-01' }),
      makeCatch({ id: 'anna-2026-b', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2900, catch_date: '2026-06-02' }),
      makeCatch({ id: 'anna-2026-c', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2800, catch_date: '2026-06-03' }),
      makeCatch({ id: 'anna-2026-d', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2700, catch_date: '2026-06-04' }),
      makeCatch({ id: 'anna-2026-e', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2600, catch_date: '2026-06-05' }),
    ];

    const leader = buildAllTimeBigFiveLeader(catches, members);

    expect(leader?.winnerName).toBe('Bert');
    expect(leader?.bestYear).toBe('2023');
    expect(leader?.total).toBe(14800);
    expect(leader?.sourceCount).toBe(5);
    expect(leader?.catchDate).toBe('2023-06-05');
    expect(leader?.catchImageUrl).toBe('bert-2023-a.jpg');
    expect(leader?.breakdown.items.map((item) => item.catchId)).toEqual([
      'bert-2023-a',
      'bert-2023-b',
      'bert-2023-c',
      'bert-2023-d',
      'bert-2023-e',
    ]);
  });

  it('ignores non-competition catches when selecting the all-time Big Five leader', () => {
    const catches = [
      makeCatch({ id: 'anna-a', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 3000, catch_date: '2026-06-01' }),
      makeCatch({ id: 'anna-b', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2500, catch_date: '2026-06-02' }),
      makeCatch({ id: 'anna-c', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Abborre', weight_g: 600, catch_date: '2026-06-03' }), // 2400
      makeCatch({ id: 'anna-d', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 2000, catch_date: '2026-06-04' }),
      makeCatch({ id: 'anna-e', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 5000, catch_date: '2026-06-05', live_scope: true }),
      makeCatch({ id: 'anna-f', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 4500, catch_date: '2026-06-06', caught_abroad: true }),
      makeCatch({ id: 'anna-g', caught_for: 'Anna', caught_for_member_id: 'member-anna', fish_type: 'Gädda', weight_g: 900, catch_date: '2026-06-07' }),

      makeCatch({ id: 'guest-a', caught_for: 'Guesty', caught_for_member_id: 'member-guest', fish_type: 'Gädda', weight_g: 6000, catch_date: '2026-06-01' }),
      makeCatch({ id: 'guest-b', caught_for: 'Guesty', caught_for_member_id: 'member-guest', fish_type: 'Gädda', weight_g: 5500, catch_date: '2026-06-02' }),
      makeCatch({ id: 'guest-c', caught_for: 'Guesty', caught_for_member_id: 'member-guest', fish_type: 'Gädda', weight_g: 5000, catch_date: '2026-06-03' }),
      makeCatch({ id: 'guest-d', caught_for: 'Guesty', caught_for_member_id: 'member-guest', fish_type: 'Gädda', weight_g: 4500, catch_date: '2026-06-04' }),
      makeCatch({ id: 'guest-e', caught_for: 'Guesty', caught_for_member_id: 'member-guest', fish_type: 'Gädda', weight_g: 4000, catch_date: '2026-06-05' }),
    ];

    const leader = buildAllTimeBigFiveLeader(catches, members);
    const leaderIds = leader?.breakdown.items.map((item) => item.catchId).slice().sort();

    expect(leader?.winnerName).toBe('Anna');
    expect(leader?.bestYear).toBe('2026');
    expect(leader?.total).toBe(10800);
    expect(leaderIds).toEqual(['anna-a', 'anna-b', 'anna-c', 'anna-d', 'anna-g'].sort());
  });
});
