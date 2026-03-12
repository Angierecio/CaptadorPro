import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  
  // --- 1. LOGIN CON GOOGLE ---
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    try {
      const callbackUrl = `https://proptech-captacion-production.up.railway.app/api/auth/google/callback`;
      const state = Buffer.from(callbackUrl ).toString('base64');
      
      const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
        `client_id=${ENV.googleClientId}&` +
        `redirect_uri=${encodeURIComponent(callbackUrl )}&` +
        `response_type=code&` +
        `scope=openid%20profile%20email&` +
        `state=${state}`;
      
      res.redirect(302, googleUrl);
    } catch (error) {
      console.error("Error al iniciar Google Auth:", error);
      res.status(500).json({ error: "Error al conectar con Google" });
    }
  });

  // --- 2. CALLBACK DE GOOGLE ---
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code) return res.status(400).send("No code provided");

    try {
      // 🚀 Intercambiamos el código por el token
      const tokenResponse = await sdk.exchangeCodeForToken(code, state || "");
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      // 🚀 Guardamos en la base de datos
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

      // 🚀 Redirigimos al dashboard
      res.redirect(302, "https://www.captadorpro.com/dashboard" );
    } catch (error) {
      console.error("ERROR CRÍTICO EN CALLBACK:", error); // 🚩 Esto nos dirá el fallo real en Railway
      res.redirect(302, "https://www.captadorpro.com/login?error=auth_failed" );
    }
  });

  // --- 3. LOGIN MANUAL ---
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
      const user = await db.getUserByEmail(email);
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
