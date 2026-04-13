export type MemberIdentitySource = {
  id: string;
  name: string;
  member_role?: string | null;
  profile_image_url?: string | null;
};

export type CatchIdentitySource = {
  id?: string;
  caught_for?: string | null;
  caught_for_member_id?: string | null;
  registered_by?: string | null;
  registered_by_member_id?: string | null;
};

type MemberLookupById = Record<string, MemberIdentitySource>;
type MemberLookupByName = Record<string, MemberIdentitySource>;

type MemberLookupMaps = {
  memberById: MemberLookupById;
  memberByName: MemberLookupByName;
};

export function normalizeIdentityValue(value?: string | null) {
  return typeof value === "string" ? value.trim() : "";
}

export function buildMemberLookupById(
  members: MemberIdentitySource[]
): MemberLookupById {
  return members.reduce<MemberLookupById>((acc, member) => {
    const id = normalizeIdentityValue(member.id);

    if (!id) {
      return acc;
    }

    acc[id] = member;
    return acc;
  }, {});
}

export function buildMemberLookupByName(
  members: MemberIdentitySource[]
): MemberLookupByName {
  return members.reduce<MemberLookupByName>((acc, member) => {
    const name = normalizeIdentityValue(member.name);

    if (!name) {
      return acc;
    }

    acc[name] = member;
    return acc;
  }, {});
}

export function resolveCatchOwnerMember(
  catchItem: CatchIdentitySource,
  lookups: MemberLookupMaps
): MemberIdentitySource | null {
  const memberId = normalizeIdentityValue(catchItem.caught_for_member_id);

  if (memberId && lookups.memberById[memberId]) {
    return lookups.memberById[memberId];
  }

  const fallbackName = normalizeIdentityValue(catchItem.caught_for);

  if (fallbackName && lookups.memberByName[fallbackName]) {
    return lookups.memberByName[fallbackName];
  }

  return null;
}

export function resolveCatchRegistrarMember(
  catchItem: CatchIdentitySource,
  lookups: MemberLookupMaps
): MemberIdentitySource | null {
  const memberId = normalizeIdentityValue(catchItem.registered_by_member_id);

  if (memberId && lookups.memberById[memberId]) {
    return lookups.memberById[memberId];
  }

  const fallbackName = normalizeIdentityValue(catchItem.registered_by);

  if (fallbackName && lookups.memberByName[fallbackName]) {
    return lookups.memberByName[fallbackName];
  }

  return null;
}

export function getCatchOwnerDisplayName(
  catchItem: CatchIdentitySource,
  members: MemberIdentitySource[]
) {
  const memberById = buildMemberLookupById(members);
  const memberByName = buildMemberLookupByName(members);
  const fallbackName = catchItem.caught_for?.trim();

  return (
    resolveCatchOwnerMember(catchItem, { memberById, memberByName })?.name ??
    (fallbackName || "Okänd medlem")
  );
}

export function getCatchRegistrarDisplayName(
  catchItem: CatchIdentitySource,
  members: MemberIdentitySource[]
) {
  const memberById = buildMemberLookupById(members);
  const memberByName = buildMemberLookupByName(members);
  const fallbackName = catchItem.registered_by?.trim();

  return (
    resolveCatchRegistrarMember(catchItem, { memberById, memberByName })?.name ??
    (fallbackName || "Okänd medlem")
  );
}

export function getMemberIdentityKey(
  member: Pick<MemberIdentitySource, "id" | "name">
) {
  const memberId = normalizeIdentityValue(member.id);

  if (memberId) {
    return `member:${memberId}`;
  }

  const memberName = normalizeIdentityValue(member.name);

  if (memberName) {
    return `name:${memberName}`;
  }

  return "unknown";
}

export function getCatchOwnerIdentityKey(
  catchItem: CatchIdentitySource,
  members?: MemberIdentitySource[]
) {
  const memberId = normalizeIdentityValue(catchItem.caught_for_member_id);

  if (memberId) {
    return `member:${memberId}`;
  }

  if (members?.length) {
    const resolvedName = getCatchOwnerDisplayName(catchItem, members);
    const resolvedMember = members.find(
      (member) =>
        normalizeIdentityValue(member.name) ===
        normalizeIdentityValue(resolvedName)
    );

    if (resolvedMember?.id) {
      return `member:${resolvedMember.id}`;
    }
  }

  const fallbackName = normalizeIdentityValue(catchItem.caught_for);

  if (fallbackName) {
    return `name:${fallbackName}`;
  }

  return catchItem.id ? `catch:${catchItem.id}` : "catch:unknown";
}

export function catchMatchesMemberIdentity(
  catchItem: CatchIdentitySource,
  member: Pick<MemberIdentitySource, "id" | "name">
) {
  const memberId = normalizeIdentityValue(member.id);
  const memberName = normalizeIdentityValue(member.name);

  if (
    memberId &&
    normalizeIdentityValue(catchItem.caught_for_member_id) === memberId
  ) {
    return true;
  }

  if (
    memberName &&
    normalizeIdentityValue(catchItem.caught_for) === memberName
  ) {
    return true;
  }

  return false;
}

export function getMemberIdentityCount(
  catches: CatchIdentitySource[],
  member: Pick<MemberIdentitySource, "id" | "name">
) {
  return catches.filter((catchItem) =>
    catchMatchesMemberIdentity(catchItem, member)
  ).length;
}

export function dedupeCatchesById<T extends { id: string }>(catches: T[]) {
  const seen = new Set<string>();
  const deduped: T[] = [];

  for (const catchItem of catches) {
    if (!catchItem?.id || seen.has(catchItem.id)) {
      continue;
    }

    seen.add(catchItem.id);
    deduped.push(catchItem);
  }

  return deduped;
}