import { describe, expect, it } from 'vitest';

import {
  buildMemberBestBigFiveBreakdown,
  calculateMemberStats,
  findBestCatchByFishType,
  findBestFineFishBySpeciesCatchMap,
  findBestSwedishFineFishCatch,
} from '@/lib/member-page';
import type { MemberCatch } from '@/types/member-page';

function makeCatch(id: string, overrides: Partial<MemberCatch> = {}): MemberCatch {
  return {
    id,
    caught_for: 'Anna',
    caught_for_member_id: 'm-anna',
    registered_by: 'Anna',
    registered_by_member_id: 'm-anna',
    fish_type: 'Gädda',
    fine_fish_type: null,
    weight_g: 1000,
    catch_date: '2026-01-01',
    location_name: 'Testsjön',
    image_url: `${id}.jpg`,
    latitude: null,
    longitude: null,
    fishing_method: 'Spinnfiske',
    live_scope: false,
    caught_abroad: false,
    is_location_private: false,
    status: 'approved',
    created_at: '2026-01-01T10:00:00Z',
    ...overrides,
  };
}

describe('member page stats helpers', () => {
  it('finds best approved catches by fish type and Swedish fine fish only', () => {
    const catches: MemberCatch[] = [
      makeCatch('pike-approved', { fish_type: 'Gädda', weight_g: 5200, status: 'approved' }),
      makeCatch('pike-pending', { fish_type: 'Gädda', weight_g: 9000, status: 'pending' }),
      makeCatch('perch-approved', { fish_type: 'Abborre', weight_g: 720, status: 'approved' }),
      makeCatch('fine-abroad', { fish_type: 'Fina fisken', fine_fish_type: 'Öring', weight_g: 4100, caught_abroad: true }),
      makeCatch('fine-swedish', { fish_type: 'Fina fisken', fine_fish_type: 'Röding', weight_g: 3300, caught_abroad: false }),
    ];

    expect(findBestCatchByFishType(catches, 'Gädda')?.id).toBe('pike-approved');
    expect(findBestCatchByFishType(catches, 'Abborre')?.id).toBe('perch-approved');
    expect(findBestSwedishFineFishCatch(catches)?.id).toBe('fine-swedish');
  });

  it('keeps best fine fish per normalized species name', () => {
    const catches: MemberCatch[] = [
      makeCatch('char-small', { fish_type: 'Fina fisken', fine_fish_type: 'rÖding', weight_g: 1800 }),
      makeCatch('char-big', { fish_type: 'Fina fisken', fine_fish_type: 'RÖDING', weight_g: 2400 }),
      makeCatch('trout', { fish_type: 'Fina fisken', fine_fish_type: 'öring', weight_g: 2000 }),
    ];

    const bestBySpecies = findBestFineFishBySpeciesCatchMap(catches);

    expect(Object.keys(bestBySpecies).sort()).toEqual(['Röding', 'Öring']);
    expect(bestBySpecies['Röding']?.id).toBe('char-big');
    expect(bestBySpecies['Öring']?.id).toBe('trout');
  });

  it('builds member stats with approved, pending and best big five values', () => {
    const catches: MemberCatch[] = [
      makeCatch('p1', { fish_type: 'Gädda', weight_g: 4000, catch_date: '2026-05-01' }),
      makeCatch('p2', { fish_type: 'Gädda', weight_g: 3500, catch_date: '2026-05-02' }),
      makeCatch('p3', { fish_type: 'Abborre', weight_g: 500, catch_date: '2026-05-03' }),
      makeCatch('p4', { fish_type: 'Fina fisken', fine_fish_type: 'Gös', weight_g: 2000, catch_date: '2026-05-04' }),
      makeCatch('p5', { fish_type: 'Fina fisken', fine_fish_type: 'Röding', weight_g: 1300, catch_date: '2026-05-05' }),
      makeCatch('pending-1', { fish_type: 'Gädda', weight_g: 9000, status: 'pending' }),
      makeCatch('abroad-1', { fish_type: 'Fina fisken', fine_fish_type: 'Öring', weight_g: 5000, caught_abroad: true }),
      makeCatch('live-1', { fish_type: 'Gädda', weight_g: 8000, live_scope: true }),
    ];

    const stats = calculateMemberStats(catches, 'competition_member');

    expect(stats.totalCatches).toBe(8);
    expect(stats.approvedCatches).toBe(7);
    expect(stats.pendingCatches).toBe(1);
    expect(stats.biggestPike).toBe('8.00 kg');
    expect(stats.biggestPerch).toBe('500 g');
    expect(stats.bestFineFish).toBe('Gös - 2.00 kg');
    expect(stats.bestBigFive).toBe('12.80 kg');
    expect(stats.totalPikeCount).toBe(3);
    expect(stats.totalFineFishCount).toBe(3);
    expect(stats.totalPikeWeight).toBe('15.50 kg');
    expect(stats.totalFineFishWeight).toBe('8.30 kg');
    expect(stats.bestFineFishBySpecies.map((item) => item.species)).toEqual(['Öring', 'Gös', 'Röding']);
    expect(stats.fineFishSpeciesStats.map((item) => item.species)).toEqual(['Gös', 'Röding', 'Öring']);
    expect(stats.speciesAggregateStats[0]).toMatchObject({ species: 'Gädda', count: 3, totalWeight: '15.50 kg' });
  });

  it('returns no big five breakdown for guest anglers and chooses best year for members', () => {
    const catches: MemberCatch[] = [
      makeCatch('2025-a', { fish_type: 'Gädda', weight_g: 3000, catch_date: '2025-06-01' }),
      makeCatch('2025-b', { fish_type: 'Gädda', weight_g: 2500, catch_date: '2025-06-02' }),
      makeCatch('2025-c', { fish_type: 'Abborre', weight_g: 400, catch_date: '2025-06-03' }), // 1600
      makeCatch('2025-d', { fish_type: 'Fina fisken', fine_fish_type: 'Gös', weight_g: 1800, catch_date: '2025-06-04' }),
      makeCatch('2025-e', { fish_type: 'Fina fisken', fine_fish_type: 'Röding', weight_g: 1700, catch_date: '2025-06-05' }),
      makeCatch('2026-a', { fish_type: 'Gädda', weight_g: 4500, catch_date: '2026-06-01' }),
      makeCatch('2026-b', { fish_type: 'Abborre', weight_g: 300, catch_date: '2026-06-02' }), // 1200
      makeCatch('2026-c', { fish_type: 'Fina fisken', fine_fish_type: 'Gös', weight_g: 1000, catch_date: '2026-06-03' }),
      makeCatch('2026-live', { fish_type: 'Gädda', weight_g: 9000, catch_date: '2026-06-04', live_scope: true }),
    ];

    const breakdown = buildMemberBestBigFiveBreakdown(catches, 'competition_member');
    expect(breakdown?.year).toBe('2025');
    expect(breakdown?.totalWeight).toBe('10.60 kg');
    expect(breakdown?.items).toHaveLength(5);

    expect(buildMemberBestBigFiveBreakdown(catches, 'guest_angler')).toBeNull();
  });
});
