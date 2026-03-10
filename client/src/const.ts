export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getLoginUrl = () => {
  // Como ya arreglamos el servidor (oauth.ts), solo tenemos que llamar 
  // a nuestra propia "puerta". El servidor hará el resto por nosotros.
  return "/api/auth/google";
};