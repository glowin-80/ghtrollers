import { describe, expect, it } from "vitest";

import {
  buildMemberLookupById,
  buildMemberLookupByName,
  catchMatchesMemberIdentity,
  dedupeCatchesById,
  getCatchOwnerDisplayName,
  getCatchOwnerIdentityKey,
  getCatchRegistrarDisplayName,
  getMemberIdentityCount,
  getMemberIdentityKey,
  normalizeIdentityValue,
  resolveCatchOwnerMember,
  resolveCatchRegistrarMember,
} from "@/lib/catch-identity";

const members = [
  {
    id: "member-1",
    name: "Anna Andersson",
    member_role: "competition_member",
    profile_image_url: "anna.jpg",
  },
  {
    id: "member-2",
    name: "Bertil Berg",
    member_role: "guest_angler",
    profile_image_url: "bertil.jpg",
  },
] as const;

describe("catch identity", () => {
  it("normalizes identity values safely", () => {
    expect(normalizeIdentityValue("  Anna Andersson  ")).toBe("Anna Andersson");
    expect(normalizeIdentityValue("")).toBe("");
    expect(normalizeIdentityValue(null)).toBe("");
    expect(normalizeIdentityValue(undefined)).toBe("");
  });

  it("builds member lookups by id and by name", () => {
    expect(buildMemberLookupById(members as any)).toEqual({
      "member-1": members[0],
      "member-2": members[1],
    });

    expect(buildMemberLookupByName(members as any)).toEqual({
      "Anna Andersson": members[0],
      "Bertil Berg": members[1],
    });
  });

  it("resolves catch owner and registrar by member id first, then falls back to name", () => {
    const lookups = {
      memberById: buildMemberLookupById(members as any),
      memberByName: buildMemberLookupByName(members as any),
    };

    const idMatchedCatch = {
      id: "catch-1",
      caught_for: "Old Name",
      caught_for_member_id: "member-1",
      registered_by: "Someone Else",
      registered_by_member_id: "member-2",
    };

    expect(resolveCatchOwnerMember(idMatchedCatch, lookups)?.name).toBe("Anna Andersson");
    expect(resolveCatchRegistrarMember(idMatchedCatch, lookups)?.name).toBe("Bertil Berg");

    const fallbackByNameCatch = {
      id: "catch-2",
      caught_for: "Bertil Berg",
      registered_by: "Anna Andersson",
    };

    expect(resolveCatchOwnerMember(fallbackByNameCatch, lookups)?.id).toBe("member-2");
    expect(resolveCatchRegistrarMember(fallbackByNameCatch, lookups)?.id).toBe("member-1");
  });

  it("returns display names from resolved members and falls back safely when no match exists", () => {
    expect(
      getCatchOwnerDisplayName(
        {
          id: "catch-1",
          caught_for: "Old Name",
          caught_for_member_id: "member-1",
        },
        members as any
      )
    ).toBe("Anna Andersson");

    expect(
      getCatchRegistrarDisplayName(
        {
          id: "catch-2",
          registered_by: "Legacy Registrar",
        },
        members as any
      )
    ).toBe("Legacy Registrar");

    expect(
      getCatchOwnerDisplayName(
        {
          id: "catch-3",
          caught_for: null,
        },
        members as any
      )
    ).toBe("Okänd medlem");
  });

  it("builds stable identity keys with correct priority", () => {
    expect(getMemberIdentityKey({ id: "member-1", name: "Anna Andersson" })).toBe("member:member-1");
    expect(getMemberIdentityKey({ id: "", name: "Anna Andersson" })).toBe("name:Anna Andersson");

    expect(
      getCatchOwnerIdentityKey(
        {
          id: "catch-1",
          caught_for: "Old Name",
          caught_for_member_id: "member-1",
        },
        members as any
      )
    ).toBe("member:member-1");

    expect(
      getCatchOwnerIdentityKey(
        {
          id: "catch-2",
          caught_for: "Anna Andersson",
        },
        members as any
      )
    ).toBe("member:member-1");

    expect(
      getCatchOwnerIdentityKey({
        id: "catch-3",
        caught_for: "Legacy Name",
      })
    ).toBe("name:Legacy Name");

    expect(
      getCatchOwnerIdentityKey({
        id: "catch-4",
        caught_for: null,
      })
    ).toBe("catch:catch-4");
  });

  it("matches catches to members by id or name and counts them correctly", () => {
    const anna = { id: "member-1", name: "Anna Andersson" };
    const bertil = { id: "member-2", name: "Bertil Berg" };

    expect(
      catchMatchesMemberIdentity(
        {
          id: "catch-1",
          caught_for: "Old Name",
          caught_for_member_id: "member-1",
        },
        anna
      )
    ).toBe(true);

    expect(
      catchMatchesMemberIdentity(
        {
          id: "catch-2",
          caught_for: "Bertil Berg",
        },
        bertil
      )
    ).toBe(true);

    expect(
      catchMatchesMemberIdentity(
        {
          id: "catch-3",
          caught_for: "Someone Else",
        },
        anna
      )
    ).toBe(false);

    expect(
      getMemberIdentityCount(
        [
          { id: "catch-1", caught_for_member_id: "member-1", caught_for: "Old Name" },
          { id: "catch-2", caught_for: "Anna Andersson" },
          { id: "catch-3", caught_for_member_id: "member-2", caught_for: "Bertil Berg" },
          { id: "catch-4", caught_for: "Someone Else" },
        ],
        anna
      )
    ).toBe(2);
  });

  it("dedupes catches by id while preserving first occurrence order", () => {
    const deduped = dedupeCatchesById([
      { id: "catch-1", value: 1 },
      { id: "catch-2", value: 2 },
      { id: "catch-1", value: 999 },
      { id: "catch-3", value: 3 },
      { id: "", value: 4 },
    ]);

    expect(deduped).toEqual([
      { id: "catch-1", value: 1 },
      { id: "catch-2", value: 2 },
      { id: "catch-3", value: 3 },
    ]);
  });
});
