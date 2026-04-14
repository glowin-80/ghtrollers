import { describe, expect, it } from 'vitest';

import { buildAllTimeHighlights } from '@/lib/home-all-time';
import { buildLeaderboard } from '@/lib/home-leaderboard';
import type { Catch, Member } from '@/types/home';

function makeMember(overrides: Partial<Member>): Member {
  return {
    id: 'member-default',
    name: 'Default Member',
    category: 'senior',
    member_role: 'competition_member',
    is_active: true,
    ...overrides,
  };
}

function makeCatch(overrides: Partial<Catch>): Catch {
  return {
    id: 'catch-default',
    caught_for: 'Default Member',
    caught_for_member_id: 'member-default',
    registered_by: 'Default Member',
    registered_by_member_id: 'member-default',
    fish_type: 'Gädda',
    fine_fish_type: null,
    weight_g: 1000,
    catch_date: '2026-01-01',
    location_name: null,
    image_url: null,
    latitude: null,
    longitude: null,
    fishing_method: null,
    live_scope: false,
    caught_abroad: false,
    is_location_private: false,
    status: 'approved',
    ...overrides,
  };
}

describe('home leaderboard and all-time highlights', () => {
  it('builds big five leaderboard from competition-eligible catches only', () => {
    const members: Member[] = [
      makeMember({ id: 'm-anna', name: 'Anna' }),
      makeMember({ id: 'm-bert', name: 'Bert' }),
      makeMember({ id: 'm-guest', name: 'Gäst', member_role: 'guest_angler' }),
    ];

    const catches: Catch[] = [
      makeCatch({ id: 'a1', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 3000, fish_type: 'Gädda', image_url: 'a1.jpg' }),
      makeCatch({ id: 'a2', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 2500, fish_type: 'Gädda' }),
      makeCatch({ id: 'a3', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 2000, fish_type: 'Gädda' }),
      makeCatch({ id: 'a4', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 400, fish_type: 'Abborre' }),
      makeCatch({ id: 'a5', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 1500, fish_type: 'Gädda' }),
      makeCatch({ id: 'a6', caught_for: 'Anna', caught_for_member_id: 'm-anna', weight_g: 9000, fish_type: 'Gädda', live_scope: true }),
      makeCatch({ id: 'b1', caught_for: 'Bert', caught_for_member_id: 'm-bert', weight_g: 3500, fish_type: 'Gädda', image_url: 'b1.jpg' }),
      makeCatch({ id: 'b2', caught_for: 'Bert', caught_for_member_id: 'm-bert', weight_g: 3000, fish_type: 'Gädda' }),
      makeCatch({ id: 'b3', caught_for: 'Bert', caught_for_member_id: 'm-bert', weight_g: 2500, fish_type: 'Gädda' }),
      makeCatch({ id: 'guest-1', caught_for: 'Gäst', caught_for_member_id: 'm-guest', weight_g: 9900, fish_type: 'Gädda' }),
    ];

    const leaderboard = buildLeaderboard(catches, 'bigfive', members);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard.map((item) => item.name)).toEqual(['Anna', 'Bert']);
    expect(leaderboard[0]).toMatchObject({
      identityKey: 'member:m-anna',
      total: 10600,
      sourceCount: 5,
      catchImageUrl: 'a1.jpg',
    });
    expect(leaderboard[1]).toMatchObject({
      identityKey: 'member:m-bert',
      total: 9000,
      sourceCount: 3,
      catchImageUrl: 'b1.jpg',
    });
  });

  it('builds fish-specific leaderboard entries sorted by heaviest catch', () => {
    const members: Member[] = [makeMember({ id: 'm-anna', name: 'Anna' })];
    const catches: Catch[] = [
      makeCatch({ id: 'f1', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Fina fisken', fine_fish_type: 'Regnbåge', weight_g: 1800, image_url: 'fine-1.jpg' }),
      makeCatch({ id: 'f2', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Fina fisken', fine_fish_type: 'Gös', weight_g: 2400, image_url: 'fine-2.jpg' }),
      makeCatch({ id: 'f3', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Fina fisken', fine_fish_type: 'Röding', weight_g: 900, caught_abroad: true }),
    ];

    const leaderboard = buildLeaderboard(catches, 'fina', members);

    expect(leaderboard).toHaveLength(2);
    expect(leaderboard[0]).toMatchObject({
      name: 'Anna',
      total: 2400,
      detail: 'Gös',
      catchImageUrl: 'fine-2.jpg',
    });
    expect(leaderboard[1]).toMatchObject({
      total: 1800,
      detail: 'Regnbåge',
    });
  });

  it('builds all-time highlights from eligible catches and includes best-year big five', () => {
    const members: Member[] = [
      makeMember({ id: 'm-anna', name: 'Anna' }),
      makeMember({ id: 'm-bert', name: 'Bert' }),
    ];

    const catches: Catch[] = [
      makeCatch({ id: 'a1', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Gädda', weight_g: 3000, catch_date: '2024-05-01', image_url: 'a1.jpg' }),
      makeCatch({ id: 'a2', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Gädda', weight_g: 2500, catch_date: '2024-05-02' }),
      makeCatch({ id: 'a3', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Gädda', weight_g: 2000, catch_date: '2024-05-03' }),
      makeCatch({ id: 'a4', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Abborre', weight_g: 400, catch_date: '2024-05-04' }),
      makeCatch({ id: 'a5', caught_for: 'Anna', caught_for_member_id: 'm-anna', fish_type: 'Gädda', weight_g: 1500, catch_date: '2024-05-05' }),
      makeCatch({ id: 'bert-pike', caught_for: 'Bert', caught_for_member_id: 'm-bert', fish_type: 'Gädda', weight_g: 5500, catch_date: '2025-06-01', location_name: 'Storviken', image_url: 'bert-pike.jpg' }),
      makeCatch({ id: 'bert-perch', caught_for: 'Bert', caught_for_member_id: 'm-bert', fish_type: 'Abborre', weight_g: 700, catch_date: '2025-06-02', location_name: 'Abborrudden', image_url: 'bert-perch.jpg' }),
      makeCatch({ id: 'bert-fine', caught_for: 'Bert', caught_for_member_id: 'm-bert', fish_type: 'Fina fisken', fine_fish_type: 'Gös', weight_g: 2600, catch_date: '2025-06-03', location_name: 'Gösgrynnan', image_url: 'bert-fine.jpg' }),
      makeCatch({ id: 'excluded', caught_for: 'Bert', caught_for_member_id: 'm-bert', fish_type: 'Gädda', weight_g: 9900, catch_date: '2025-06-04', live_scope: true }),
    ];

    const highlights = buildAllTimeHighlights(catches, members);

    expect(highlights.map((item) => item.filter)).toEqual(['bigfive', 'abborre', 'gädda', 'fina']);

    expect(highlights[0]).toMatchObject({
      filter: 'bigfive',
      winnerName: 'Bert',
      total: 10900,
      sourceCount: 3,
      bestYear: '2025',
      catchDate: '2025-06-03',
      catchImageUrl: 'bert-pike.jpg',
    });

    expect(highlights[1]).toMatchObject({
      filter: 'abborre',
      winnerName: 'Bert',
      total: 700,
      catchDate: '2025-06-02',
      locationName: 'Abborrudden',
      catchImageUrl: 'bert-perch.jpg',
    });

    expect(highlights[2]).toMatchObject({
      filter: 'gädda',
      winnerName: 'Bert',
      total: 5500,
      catchDate: '2025-06-01',
      locationName: 'Storviken',
      catchImageUrl: 'bert-pike.jpg',
    });

    expect(highlights[3]).toMatchObject({
      filter: 'fina',
      winnerName: 'Bert',
      total: 2600,
      detail: 'Gös',
      catchDate: '2025-06-03',
      locationName: 'Gösgrynnan',
      catchImageUrl: 'bert-fine.jpg',
    });
  });
});
