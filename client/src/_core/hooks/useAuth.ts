import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  // 1. CAMBIAMOS EL PATH POR DEFECTO A /login
  const { redirectOnUnauthenticated = false, redirectPath = "/login" } =
    options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Si hay un error de red, no queremos que nos eche inmediatamente
    staleTime: 5000, 
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      window.location.href = "/"; 
    },
  });

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading,
      error: meQuery.error,
      isAuthenticated: !!meQuery.data, 
    };
  }, [meQuery.data, meQuery.isLoading, meQuery.error]);

  useEffect(() => {
    // 2. EL VIGILANTE: Si no estás logueada, te manda a /login
    if (redirectOnUnauthenticated && !state.loading && !state.isAuthenticated) {
      // Solo redirigimos si no estamos ya en la página de login
      if (window.location.pathname !== redirectPath) {
        window.location.href = redirectPath;
      }
    }
  }, [state.isAuthenticated, state.loading, redirectOnUnauthenticated, redirectPath]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}