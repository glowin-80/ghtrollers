import { describe, expect, it } from 'vitest';

import { detectAllTimeHighPushEvent } from '@/lib/all-time-high-push';
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

const members: Member[] = [
  makeMember({ id: 'm-tommy', name: 'Tommy Holmberg' }),
  makeMember({ id: 'm-bert', name: 'Bert Fiskare' }),
];

describe('all-time-high push detection', () => {
  it('detects a new pike all-time-high and uses the curiosity text', () => {
    const approvedCatch = makeCatch({
      id: 'tommy-pike-record',
      caught_for: 'Tommy Holmberg',
      caught_for_member_id: 'm-tommy',
      registered_by: 'Tommy Holmberg',
      registered_by_member_id: 'm-tommy',
      fish_type: 'Gädda',
      weight_g: 9500,
      catch_date: '2026-06-01',
    });
    const beforeCatches = [
      makeCatch({
        id: 'bert-old-pike',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 9000,
        catch_date: '2025-06-01',
      }),
    ];

    const event = detectAllTimeHighPushEvent({
      beforeCatches,
      afterCatches: [...beforeCatches, approvedCatch],
      members,
      approvedCatch,
    });

    expect(event).toEqual({
      filter: 'gädda',
      title: 'Nytt All-time-high 🔥',
      body: 'Tommy slår all-time-high med en fet Gädda!!!',
      url: '/all-time-high',
    });
  });

  it('detects a new fine fish all-time-high and names the actual species', () => {
    const approvedCatch = makeCatch({
      id: 'tommy-zander-record',
      caught_for: 'Tommy Holmberg',
      caught_for_member_id: 'm-tommy',
      registered_by: 'Tommy Holmberg',
      registered_by_member_id: 'm-tommy',
      fish_type: 'Fina fisken',
      fine_fish_type: 'Gös',
      weight_g: 5000,
      catch_date: '2026-06-01',
    });
    const beforeCatches = [
      makeCatch({
        id: 'bert-old-fine',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Fina fisken',
        fine_fish_type: 'Regnbåge',
        weight_g: 4500,
        catch_date: '2025-06-01',
      }),
    ];

    const event = detectAllTimeHighPushEvent({
      beforeCatches,
      afterCatches: [...beforeCatches, approvedCatch],
      members,
      approvedCatch,
    });

    expect(event?.body).toBe('Tommy slår all-time-high för Fina fisken med en fet Gös!!!');
  });

  it('detects Big Five all-time-high when the catch improves the annual total without setting a species record', () => {
    const bertBigFive = [
      makeCatch({
        id: 'bert-a',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 3000,
        catch_date: '2025-06-01',
      }),
      makeCatch({
        id: 'bert-b',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 2500,
        catch_date: '2025-06-02',
      }),
      makeCatch({
        id: 'bert-c',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 2000,
        catch_date: '2025-06-03',
      }),
      makeCatch({
        id: 'bert-d',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 1500,
        catch_date: '2025-06-04',
      }),
      makeCatch({
        id: 'bert-e',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 1000,
        catch_date: '2025-06-05',
      }),
      makeCatch({
        id: 'bert-pike-record',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 11900,
        catch_date: '2024-06-01',
      }),
    ];

    const tommyBefore = [
      makeCatch({
        id: 'tommy-a',
        caught_for: 'Tommy Holmberg',
        caught_for_member_id: 'm-tommy',
        fish_type: 'Gädda',
        weight_g: 2600,
        catch_date: '2026-06-01',
      }),
      makeCatch({
        id: 'tommy-b',
        caught_for: 'Tommy Holmberg',
        caught_for_member_id: 'm-tommy',
        fish_type: 'Gädda',
        weight_g: 2500,
        catch_date: '2026-06-02',
      }),
      makeCatch({
        id: 'tommy-c',
        caught_for: 'Tommy Holmberg',
        caught_for_member_id: 'm-tommy',
        fish_type: 'Gädda',
        weight_g: 2400,
        catch_date: '2026-06-03',
      }),
      makeCatch({
        id: 'tommy-d',
        caught_for: 'Tommy Holmberg',
        caught_for_member_id: 'm-tommy',
        fish_type: 'Gädda',
        weight_g: 2300,
        catch_date: '2026-06-04',
      }),
    ];

    const approvedCatch = makeCatch({
      id: 'tommy-big-five-record',
      caught_for: 'Tommy Holmberg',
      caught_for_member_id: 'm-tommy',
      fish_type: 'Gädda',
      weight_g: 2200,
      catch_date: '2026-06-05',
    });

    const beforeCatches = [...bertBigFive, ...tommyBefore];

    const event = detectAllTimeHighPushEvent({
      beforeCatches,
      afterCatches: [...beforeCatches, approvedCatch],
      members,
      approvedCatch,
    });

    expect(event).toMatchObject({
      filter: 'bigfive',
      body: 'Tommy slår all-time-high för Big Five!!!',
    });
  });

  it('does not trigger when the approved catch does not beat an all-time-high', () => {
    const approvedCatch = makeCatch({
      id: 'tommy-normal-pike',
      caught_for: 'Tommy Holmberg',
      caught_for_member_id: 'm-tommy',
      fish_type: 'Gädda',
      weight_g: 3000,
      catch_date: '2026-06-01',
    });
    const beforeCatches = [
      makeCatch({
        id: 'bert-old-pike',
        caught_for: 'Bert Fiskare',
        caught_for_member_id: 'm-bert',
        fish_type: 'Gädda',
        weight_g: 9000,
        catch_date: '2025-06-01',
      }),
    ];

    const event = detectAllTimeHighPushEvent({
      beforeCatches,
      afterCatches: [...beforeCatches, approvedCatch],
      members,
      approvedCatch,
    });

    expect(event).toBeNull();
  });
});