import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { notifyOwner } from "./notification";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  
  // --- 1. LOGIN DIRECTO CON GOOGLE ---
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    try {
      // 🚀 CAMBIO: Usamos la URL de Railway para el callback, es más directo y seguro
      const callbackUrl = `https://proptech-captacion-production.up.railway.app/api/auth/google/callback`;
      const state = Buffer.from(callbackUrl).toString('base64');
      
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
        `client_id=${ENV.googleClientId}&` +
        `redirect_uri=${encodeURIComponent(callbackUrl)}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `state=${state}`;
      
      res.redirect(302, googleUrl);
    } catch (error) {
      res.status(500).json({ error: "Error al conectar con Google" });
    }
  });

  // --- 2. CALLBACK DE GOOGLE ---
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) return res.status(400).send("No code provided");

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state || "");
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // 🚀 CAMBIO VITAL: Te mandamos de vuelta a Vercel, no a Railway
      const frontendUrl = process.env.FRONTEND_URL || "https://www.captadorpro.com";
res.redirect(302, `${frontendUrl}/dashboard`);
    } catch (error) {
      // 🚀 CAMBIO: Si falla, te mandamos al login de Vercel
      res.redirect(302, "https://www.captadorpro.com/login?error=auth_failed");
    }
  });

  // --- 3. LOGIN MANUAL (EMAIL/PASSWORD) ---
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await db.getUserByEmail(email);
      // Nota: Aquí deberías usar una comparación de hash, pero lo dejamos así para que coincida con tu lógica actual
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || "Agente",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  });
}