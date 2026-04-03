import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  createGuestAuthMemberState,
  getCurrentAuthMemberState,
  type AuthMemberState,
} from "@/lib/auth-member";

export function useAuthMember() {
  const [state, setState] = useState<AuthMemberState>(
    createGuestAuthMemberState()
  );
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const nextState = await getCurrentAuthMemberState();
      setState(nextState);
    } catch (error) {
      console.error(error);
      setState(createGuestAuthMemberState());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const nextState = await getCurrentAuthMemberState();

        if (!mounted) {
          return;
        }

        setState(nextState);
      } catch (error) {
        console.error(error);

        if (!mounted) {
          return;
        }

        setState(createGuestAuthMemberState());
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    function handleProfileImageUpdated(event: Event) {
      const customEvent = event as CustomEvent<{ imageUrl?: string }>;
      const imageUrl = customEvent.detail?.imageUrl ?? null;

      setState((prev) => ({
        ...prev,
        profileImageUrl: imageUrl,
        member: prev.member
          ? {
              ...prev.member,
              profile_image_url: imageUrl,
            }
          : prev.member,
      }));
    }

    window.addEventListener("profile-image-updated", handleProfileImageUpdated);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(
        "profile-image-updated",
        handleProfileImageUpdated
      );
    };
  }, [refresh]);

  return {
    ...state,
    loading,
    hasActiveMembership: state.membershipStatus === "active",
    refresh,
  };
}
