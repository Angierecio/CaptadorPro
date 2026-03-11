import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { users } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

type User = typeof users.$inferSelect;

class SDKServer {
  // Usamos una clave secreta para firmar tus sesiones
  private getSessionSecret() {
    // Si no tienes cookieSecret, usa el Id de cliente como fallback para no romper el login
    const secret = ENV.cookieSecret || ENV.googleClientId || "super-secret-fallback";
    return new TextEncoder().encode(secret);
  }

  async exchangeCodeForToken(code: string, state: string): Promise<any> {
    try {
      // Decodificamos el estado de forma segura para Node.js
      const redirectUri = Buffer.from(state, 'base64').toString('utf-8');
      
      const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: ENV.googleClientId,
        client_secret: ENV.googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      return { accessToken: response.data.access_token };
    } catch (error: any) {
      console.error("[SDK] Error al intercambiar código por token:", error.response?.data || error.message);
      throw error;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return { openId: data.sub, name: data.name, email: data.email };
  }

  async createSessionToken(openId: string, options: any = {}): Promise<string> {
    const secretKey = this.getSessionSecret();
    return new SignJWT({ openId, name: options.name || "" })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt()
      .setExpirationTime('365d') // Sesión de un año
      .sign(secretKey);
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookieHeader(cookieHeader || "");
    const sessionCookie = cookies[COOKIE_NAME];
    
    if (!sessionCookie) {
      // Este log es normal si no estás logueado
      throw ForbiddenError("Sesión no encontrada");
    }
    
    try {
      const { payload } = await jwtVerify(sessionCookie, this.getSessionSecret());
      const openId = payload.openId as string;
      
      const user = await db.getUserByOpenId(openId);
      
      if (!user) {
        console.error(`[AUTH] El usuario ${openId} no existe en la base de datos.`);
        throw ForbiddenError("Usuario no registrado");
      }
      
      return user as User;
    } catch (error) {
      console.error("[AUTH] Error: El token JWT es inválido o ha expirado");
      throw ForbiddenError("Sesión inválida");
    }
  }
}

export const sdk = new SDKServer();