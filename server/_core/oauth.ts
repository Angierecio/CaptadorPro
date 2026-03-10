import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { notifyOwner } from "./notification";
import { sdk } from "./sdk";
import { ENV } from "./env"; // Importamos la configuración

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  
  // 1. RUTA DE SALIDA (Corregida para que no dé error de TypeScript)
  app.get("/api/auth/google", async (req: Request, res: Response) => {
    try {
      // Definimos a dónde debe volver Google después del login
      const callbackUrl = `https://captadorpro.com/api/auth/google/callback`;
      
      // El sistema de Manus espera que el "state" sea la URL de retorno en base64
      const state = Buffer.from(callbackUrl).toString('base64');

      // Construimos la URL manualmente ya que el SDK no tiene la función
      const loginUrl = `${ENV.oAuthServerUrl}/login?appId=${ENV.appId}&state=${state}&redirectUri=${encodeURIComponent(callbackUrl)}`;
      
      console.log("[OAuth] Redirigiendo a Google:", loginUrl);
      res.redirect(302, loginUrl);
    } catch (error) {
      console.error("[OAuth] Error al construir URL de salida", error);
      res.status(500).json({ error: "Error interno al iniciar login" });
    }
  });

  // 2. RUTA DE LLEGADA (Donde Google te devuelve)
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "Faltan code o state" });
      return;
    }

    try {
      // Usamos las funciones que SÍ existen en tu sdk.ts
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isNewUser = !existingUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      if (isNewUser) {
        notifyOwner({
          title: `🏠 Nuevo cliente: ${userInfo.name || "Sin nombre"}`,
          content: `Email: ${userInfo.email || "Sin email"}`,
        }).catch(() => {});
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "Fallo al procesar el inicio de sesión" });
    }
  });
}