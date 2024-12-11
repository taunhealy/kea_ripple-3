import { useSession } from "next-auth/react";

export function useAuthRedirect() {
  const { data: session, status } = useSession();

  return { session, status };
}
