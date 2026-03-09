export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  // 1. Detectamos si estamos en producción o en local
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  // 2. Usamos las variables de Vercel (si existen) o localhost como plan B
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "http://localhost:3000";
  const appId = import.meta.env.VITE_APP_ID || "captador-pro-local";
  
  // 3. Generamos la URL de retorno automáticamente (www.captadorpro.com/dashboard)
  const origin = typeof window !== 'undefined' ? window.location.origin : "http://localhost:5173";
  const redirectUri = `${origin}/dashboard`;
  const state = btoa(redirectUri);

  // 4. Construimos la URL final
  const url = new URL(`${oauthPortalUrl}/auth/google`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);

  return url.toString();
};