import type { Catch, Member } from "@/types/home";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

type CatchIdentitySource = Pick<
  Catch,
  "caught_for" | "registered_by" | "caught_for_member_id" | "registered_by_member_id"
>;

type MemberIdentitySource = Pick<Member, "id" | "name">;
type MemberProfileIdentitySource = Pick<MemberProfile, "id" | "name">;

export function normalizeIdentityValue(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function buildMemberLookupById<T extends MemberIdentitySource>(members: T[]) {
  return members.reduce<Record<string, T>>((acc, member) => {
    const key = normalizeIdentityValue(member.id);
    if (key) {
      acc[key] = member;
    }
    return acc;
  }, {});
}

export function buildMemberLookupByName<T extends MemberIdentitySource>(members: T[]) {
  return members.reduce<Record<string, T>>((acc, member) => {
    const key = normalizeIdentityValue(member.name);
    if (key) {
      acc[key] = member;
    }
    return acc;
  }, {});
}

export function getCatchOwnerIdentityKey(catchItem: Pick<CatchIdentitySource, "caught_for" | "caught_for_member_id">) {
  return normalizeIdentityValue(catchItem.caught_for_member_id) || normalizeIdentityValue(catchItem.caught_for);
}

export function getCatchRegistrarIdentityKey(catchItem: Pick<CatchIdentitySource, "registered_by" | "registered_by_member_id">) {
  return normalizeIdentityValue(catchItem.registered_by_member_id) || normalizeIdentityValue(catchItem.registered_by);
}

export function resolveCatchOwnerMember<T extends MemberIdentitySource>(
  catchItem: Pick<CatchIdentitySource, "caught_for" | "caught_for_member_id">,
  lookups: {
    memberById: Record<string, T>;
    memberByName: Record<string, T>;
  }
): T | null {
  const ownerId = normalizeIdentityValue(catchItem.caught_for_member_id);
  if (ownerId && lookups.memberById[ownerId]) {
    return lookups.memberById[ownerId];
  }

  const ownerName = normalizeIdentityValue(catchItem.caught_for);
  return ownerName ? lookups.memberByName[ownerName] ?? null : null;
}

export function resolveCatchRegistrarMember<T extends MemberIdentitySource>(
  catchItem: Pick<CatchIdentitySource, "registered_by" | "registered_by_member_id">,
  lookups: {
    memberById: Record<string, T>;
    memberByName: Record<string, T>;
  }
): T | null {
  const registrarId = normalizeIdentityValue(catchItem.registered_by_member_id);
  if (registrarId && lookups.memberById[registrarId]) {
    return lookups.memberById[registrarId];
  }

  const registrarName = normalizeIdentityValue(catchItem.registered_by);
  return registrarName ? lookups.memberByName[registrarName] ?? null : null;
}

export function getCatchOwnerDisplayName(
  catchItem: Pick<CatchIdentitySource, "caught_for" | "caught_for_member_id">,
  members: Member[]
) {
  const memberById = buildMemberLookupById(members);
  const memberByName = buildMemberLookupByName(members);
  const fallbackName = normalizeIdentityValue(catchItem.caught_for);

  return (
    resolveCatchOwnerMember(catchItem, { memberById, memberByName })?.name ??
    fallbackName ||
    "Okänd medlem"
  );
}

export function getCatchRegistrarDisplayName(
  catchItem: Pick<CatchIdentitySource, "registered_by" | "registered_by_member_id">,
  members: Member[]
) {
  const memberById = buildMemberLookupById(members);
  const memberByName = buildMemberLookupByName(members);
  const fallbackName = normalizeIdentityValue(catchItem.registered_by);

  return (
    resolveCatchRegistrarMember(catchItem, { memberById, memberByName })?.name ??
    fallbackName ||
    "Okänd medlem"
  );
}

export function doesCatchBelongToMember(
  catchItem: Pick<CatchIdentitySource, "caught_for" | "caught_for_member_id">,
  member: MemberProfileIdentitySource
) {
  const memberId = normalizeIdentityValue(member.id);
  const catchOwnerId = normalizeIdentityValue(catchItem.caught_for_member_id);

  if (memberId && catchOwnerId) {
    return memberId === catchOwnerId;
  }

  return normalizeIdentityValue(member.name) !== "" && normalizeIdentityValue(member.name) === normalizeIdentityValue(catchItem.caught_for);
}

export function getMemberIdentityCount<T extends CatchIdentitySource>(
  catches: T[],
  member: MemberProfileIdentitySource
) {
  return catches.filter((catchItem) => doesCatchBelongToMember(catchItem, member)).length;
}

export function dedupeCatchesById<T extends Pick<Catch | MemberCatch, "id">>(catches: T[]) {
  const seen = new Set<string>();
  return catches.filter((catchItem) => {
    const key = normalizeIdentityValue(catchItem.id);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
