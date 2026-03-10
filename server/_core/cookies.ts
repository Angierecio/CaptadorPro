import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(req: Request): CookieOptions {
  // 1. Detectamos si estamos en producción (no es localhost)
  const isProd = !req.hostname.includes("localhost") && !req.hostname.includes("127.0.0.1");

  return {
    httpOnly: true,
    path: "/",
    // 'none' es obligatorio para que la cookie viaje de Railway a Vercel
    sameSite: "none", 
    // 'secure' debe ser true en producción para que 'none' funcione
    secure: true, 
    // 2. ACTIVAMOS EL DOMINIO: Esto es lo que evita el rebote
    // Usamos ".captadorpro.com" para que valga para la web y para la API
    domain: isProd ? ".captadorpro.com" : undefined,
  };
}