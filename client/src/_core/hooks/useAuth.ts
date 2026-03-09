import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = "/auth" } =
    options ?? {};
  const utils = trpc.useUtils();

  // --- MODO REAL ACTIVADO ---
  // Ahora sí le preguntamos al servidor quién es el usuario
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      window.location.href = "/"; // Al cerrar sesión, volvemos a la landing
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
      isAuthenticated: !!meQuery.data, // Solo es true si el servidor devuelve un usuario real
    };
  }, [meQuery.data, meQuery.isLoading, meQuery.error]);

  useEffect(() => {
    // Si no está autenticado y la página exige estarlo, mandamos a /auth
    if (redirectOnUnauthenticated && !state.loading && !state.isAuthenticated) {
      window.location.href = redirectPath;
    }
  }, [state.isAuthenticated, state.loading, redirectOnUnauthenticated, redirectPath]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}