import { describe, expect, it } from 'vitest';

import {
  canViewerSeePrivateLocation,
  sanitizeCatchLocationForViewer,
} from '@/lib/ght-rules';

const baseCatch = {
  id: 'catch-1',
  caught_for: 'Anna Andersson',
  caught_for_member_id: 'member-anna',
  registered_by: 'Bertil Berg',
  registered_by_member_id: 'member-bertil',
  fish_type: 'Gädda',
  weight_g: 3200,
  catch_date: '2026-06-01',
  status: 'approved',
  location_name: 'Hemlig vik',
  latitude: 59.1,
  longitude: 18.1,
  is_location_private: true,
};

describe('private location visibility', () => {
  it('allows all viewers to see non-private locations', () => {
    expect(
      canViewerSeePrivateLocation(
        { ...baseCatch, is_location_private: false },
        { isLoggedIn: false }
      )
    ).toBe(true);
  });

  it('hides private locations from logged-out viewers', () => {
    expect(
      canViewerSeePrivateLocation(baseCatch, { isLoggedIn: false })
    ).toBe(false);
  });

  it('allows super admins to see private locations', () => {
    expect(
      canViewerSeePrivateLocation(baseCatch, {
        isLoggedIn: true,
        isSuperAdmin: true,
        memberId: 'someone-else',
      })
    ).toBe(true);
  });

  it('allows owner or registrar by member id', () => {
    expect(
      canViewerSeePrivateLocation(baseCatch, {
        isLoggedIn: true,
        memberId: 'member-anna',
      })
    ).toBe(true);

    expect(
      canViewerSeePrivateLocation(baseCatch, {
        isLoggedIn: true,
        memberId: 'member-bertil',
      })
    ).toBe(true);
  });

  it('falls back to trimmed legacy names when member ids are missing', () => {
    const legacyCatch = {
      ...baseCatch,
      caught_for_member_id: null,
      registered_by_member_id: null,
      caught_for: '  Anna Andersson  ',
      registered_by: ' Bertil Berg ',
    };

    expect(
      canViewerSeePrivateLocation(legacyCatch, {
        isLoggedIn: true,
        memberName: 'Anna Andersson',
      })
    ).toBe(true);

    expect(
      canViewerSeePrivateLocation(legacyCatch, {
        isLoggedIn: true,
        memberName: 'Bertil Berg',
      })
    ).toBe(true);

    expect(
      canViewerSeePrivateLocation(legacyCatch, {
        isLoggedIn: true,
        memberName: 'Cecilia',
      })
    ).toBe(false);
  });

  it('sanitizes location fields when viewer should not see them', () => {
    const sanitized = sanitizeCatchLocationForViewer(baseCatch as any, {
      isLoggedIn: true,
      memberId: 'someone-else',
    });

    expect(sanitized.location_name).toBeNull();
    expect(sanitized.latitude).toBeNull();
    expect(sanitized.longitude).toBeNull();
    expect(sanitized.weight_g).toBe(3200);
    expect(sanitized.fish_type).toBe('Gädda');
  });

  it('preserves location fields when viewer is allowed to see them', () => {
    const sanitized = sanitizeCatchLocationForViewer(baseCatch as any, {
      isLoggedIn: true,
      memberId: 'member-anna',
    });

    expect(sanitized.location_name).toBe('Hemlig vik');
    expect(sanitized.latitude).toBe(59.1);
    expect(sanitized.longitude).toBe(18.1);
  });
});
