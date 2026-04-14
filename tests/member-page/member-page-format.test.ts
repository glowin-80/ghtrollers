import { describe, expect, it } from 'vitest';

import {
  formatDate,
  formatWeight,
  getCatchReportAnchorId,
  getDisplayFishName,
  getStatusClasses,
  getStatusLabel,
  normalizeFineFishSpeciesName,
} from '@/lib/member-page';
import type { MemberCatch } from '@/types/member-page';

function makeCatch(overrides: Partial<MemberCatch> = {}): MemberCatch {
  return {
    id: 'catch-1',
    caught_for: 'Anna',
    caught_for_member_id: 'm-anna',
    registered_by: 'Anna',
    registered_by_member_id: 'm-anna',
    fish_type: 'Gädda',
    fine_fish_type: null,
    weight_g: 2500,
    catch_date: '2026-04-14',
    location_name: 'Testsjön',
    image_url: 'catch.jpg',
    latitude: null,
    longitude: null,
    fishing_method: 'Spinnfiske',
    live_scope: false,
    caught_abroad: false,
    is_location_private: false,
    status: 'approved',
    created_at: '2026-04-14T10:00:00Z',
    ...overrides,
  };
}

describe('member page formatting helpers', () => {
  it('formats grams and kilograms consistently', () => {
    expect(formatWeight(undefined)).toBe('-');
    expect(formatWeight(null)).toBe('-');
    expect(formatWeight(0)).toBe('-');
    expect(formatWeight(250)).toBe('250 g');
    expect(formatWeight(2500)).toBe('2.50 kg');
  });

  it('formats Swedish dates and safe fallbacks', () => {
    expect(formatDate('2026-04-14')).toBe('2026-04-14');
    expect(getCatchReportAnchorId('abc123')).toBe('catch-report-abc123');
  });

  it('returns expected fish display names', () => {
    expect(getDisplayFishName(makeCatch({ fish_type: 'Gädda' }))).toBe('Gädda');
    expect(
      getDisplayFishName(
        makeCatch({ fish_type: 'Fina fisken', fine_fish_type: 'rÖding' })
      )
    ).toBe('Fina fisken (rÖding)');
  });

  it('formats and normalizes status and fine fish species labels', () => {
    expect(getStatusLabel('approved')).toBe('Godkänd');
    expect(getStatusLabel('pending')).toBe('Väntar');
    expect(getStatusLabel('rejected')).toBe('Nekad');
    expect(getStatusLabel('custom')).toBe('custom');

    expect(getStatusClasses('approved')).toContain('text-[#2f6b3b]');
    expect(getStatusClasses('pending')).toContain('text-[#8a5a00]');
    expect(getStatusClasses('rejected')).toContain('text-[#9f2d2d]');
    expect(getStatusClasses('other')).toContain('text-[#4b5563]');

    expect(normalizeFineFishSpeciesName(undefined)).toBe('Okänd');
    expect(normalizeFineFishSpeciesName('')).toBe('Okänd');
    expect(normalizeFineFishSpeciesName('  röDing  ')).toBe('Röding');
  });
});
