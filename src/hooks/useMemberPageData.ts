import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchCurrentMemberProfile,
  fetchMemberCatchesForMember,
} from "@/lib/member-service";
import type { MemberCatch, MemberProfile } from "@/types/member-page";

export function useMemberPageData() {
  const mountedRef = useRef(true);

  const [pageLoading, setPageLoading] = useState(true);
  const [catchesLoading, setCatchesLoading] = useState(false);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [catches, setCatches] = useState<MemberCatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [catchesError, setCatchesError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMemberCatches = useCallback(async (resolvedMember: Pick<MemberProfile, "id" | "name">) => {
    try {
      if (mountedRef.current) {
        setCatchesLoading(true);
        setCatchesError(null);
      }

      const catchesData = await fetchMemberCatchesForMember(resolvedMember);

      if (!mountedRef.current) {
        return;
      }

      setCatches(catchesData);
    } catch (err) {
      console.error(err);

      if (!mountedRef.current) {
        return;
      }

      setCatches([]);
      setCatchesError("Kunde inte ladda dina fångster just nu.");
    } finally {
      if (mountedRef.current) {
        setCatchesLoading(false);
      }
    }
  }, []);

  const loadPage = useCallback(async () => {
    try {
      if (mountedRef.current) {
        setPageLoading(true);
        setError(null);
        setCatchesError(null);
      }

      const resolvedMember = await fetchCurrentMemberProfile();

      if (!mountedRef.current) {
        return;
      }

      if (!resolvedMember) {
        setMember(null);
        setCatches([]);
        setPageLoading(false);
        return;
      }

      setMember(resolvedMember);
      setPageLoading(false);

      if (!resolvedMember.is_active) {
        setCatches([]);
        return;
      }

      await loadMemberCatches(resolvedMember);
    } catch (err) {
      console.error(err);

      if (!mountedRef.current) {
        return;
      }

      setError("Kunde inte ladda medlemssidan.");
      setPageLoading(false);
    }
  }, [loadMemberCatches]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const handleProfileImageUploaded = useCallback((imageUrl: string) => {
    setMember((prev: MemberProfile | null) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        profile_image_url: imageUrl,
      };
    });
  }, []);

  return {
    pageLoading,
    catchesLoading,
    member,
    catches,
    error,
    catchesError,
    loadPage,
    loadMemberCatches,
    handleProfileImageUploaded,
  };
}
