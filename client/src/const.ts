export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generamos la URL de login apuntando directamente a nuestro servidor (Puerto 3000)
export const getLoginUrl = () => {
  // Forzamos la dirección del servidor para que no haya errores de URL inválida
  const oauthPortalUrl = "http://localhost:3000";
  const appId = "captador-pro-local";
  
  // Queremos que después de "loguearnos" nos devuelva al Dashboard de la web
  const redirectUri = "http://localhost:5173/dashboard";
  const state = btoa(redirectUri);

  // Usamos la ruta de autenticación directa del servidor
  const url = new URL(`${oauthPortalUrl}/auth/google`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);

  return url.toString();
};