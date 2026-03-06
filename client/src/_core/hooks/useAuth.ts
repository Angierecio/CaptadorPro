import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();

  // --- MODO HACK ACTIVADO ---
  // Comentamos la consulta real al servidor para que no busque a Google
  /*
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  */

  // Simulamos que el servidor nos ha respondido con tu usuario de Supabase
  const fakeUser = {
    id: 4, 
    name: "Admin Pro", 
    email: "admin@local.com", 
    role: "admin", 
    isActive: true 
  };

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    // En modo hack, el logout solo te avisa pero no hace falta borrar sesión real
    console.log("Logout simulado");
    window.location.href = "/";
  }, []);

  const state = useMemo(() => {
    // Guardamos al usuario "fake" en el almacenamiento local para que la web lo reconozca
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(fakeUser)
    );
    
    return {
      user: fakeUser, // <--- Forzamos al Usuario 4
      loading: false, // <--- No hay espera
      error: null,
      isAuthenticated: true, // <--- ¡Puerta abierta!
    };
  }, [logoutMutation.error, logoutMutation.isPending]);

  useEffect(() => {
    // En modo hack, nunca redirigimos al login porque ya estamos "dentro"
    if (!redirectOnUnauthenticated) return;
    if (state.user) return;
    
    // Si por algún motivo se pierde el usuario, podrías mandarlo al inicio
    // window.location.href = "/" 
  }, [state.user]);

  return {
    ...state,
    refresh: () => console.log("Refresh simulado"),
    logout,
  };
}