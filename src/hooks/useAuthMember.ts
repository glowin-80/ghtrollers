import { useAuthMemberContext } from "@/components/providers/AuthMemberProvider";

export function useAuthMember() {
  return useAuthMemberContext();
}
