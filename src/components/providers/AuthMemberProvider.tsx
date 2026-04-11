"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  createGuestAuthMemberState,
  getCurrentAuthMemberState,
  type AuthMemberState,
} from "@/lib/auth-member";
import {
  PROFILE_IMAGE_UPDATED_EVENT,
  type ProfileImageUpdatedDetail,
} from "@/lib/auth-member-events";

type AuthMemberContextValue = AuthMemberState & {
  loading: boolean;
  hasActiveMembership: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  refresh: () => Promise<void>;
};

const AuthMemberContext = createContext<AuthMemberContextValue | null>(null);

export function AuthMemberProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthMemberState>(createGuestAuthMemberState());
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

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });

    function handleProfileImageUpdated(event: Event) {
      const customEvent = event as CustomEvent<ProfileImageUpdatedDetail>;
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

    window.addEventListener(
      PROFILE_IMAGE_UPDATED_EVENT,
      handleProfileImageUpdated as EventListener
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener(
        PROFILE_IMAGE_UPDATED_EVENT,
        handleProfileImageUpdated as EventListener
      );
    };
  }, [refresh]);

  const value = useMemo<AuthMemberContextValue>(
    () => ({
      ...state,
      loading,
      hasActiveMembership: state.membershipStatus === "active",
      isAdmin: Boolean(state.member?.is_admin || state.member?.is_super_admin),
      isSuperAdmin: Boolean(state.member?.is_super_admin),
      refresh,
    }),
    [state, loading, refresh]
  );

  return (
    <AuthMemberContext.Provider value={value}>
      {children}
    </AuthMemberContext.Provider>
  );
}

export function useAuthMemberContext() {
  const context = useContext(AuthMemberContext);

  if (!context) {
    throw new Error("useAuthMember must be used within AuthMemberProvider.");
  }

  return context;
}
