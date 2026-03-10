import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  return {
    httpOnly: true,
    path: "/",
    // 'none' permite que la cookie viaje desde tu API en Railway a tu web en Vercel
    sameSite: "none", 
    // 'secure' debe ser true siempre para que 'sameSite: none' funcione en 2026
    secure: true, 
    // 🚩 IMPORTANTE: Al dejar el dominio como undefined, la cookie se queda 
    // en Railway y el navegador la enviará correctamente al usar la URL absoluta.
    domain: undefined,
  };
}