import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import axios, { type AxiosInstance } from "axios";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import { users } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

type User = typeof users.$inferSelect;

class SDKServer {
  private getSessionSecret() {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  async exchangeCodeForToken(code: string, state: string): Promise<any> {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: ENV.googleClientId,
      client_secret: ENV.googleClientSecret,
      redirect_uri: atob(state),
      grant_type: 'authorization_code',
    });
    return { accessToken: response.data.access_token };
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
      .setExpirationTime(Math.floor((Date.now() + (options.expiresInMs || ONE_YEAR_MS)) / 1000))
      .sign(secretKey);
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookieHeader = req.headers.cookie;
    const cookies = parseCookieHeader(cookieHeader || "");
    const sessionCookie = cookies[COOKIE_NAME];
    
    if (!sessionCookie) {
      console.log("[AUTH] Error: No se encontró la cookie en la petición");
      throw ForbiddenError("Sesión no encontrada");
    }
    
    try {
      const { payload } = await jwtVerify(sessionCookie, this.getSessionSecret());
      const openId = payload.openId as string;
      
      const user = await db.getUserByOpenId(openId);
      
      if (!user) {
        console.log(`[AUTH] Error: Usuario con openId ${openId} no existe en DB`);
        throw ForbiddenError("Usuario no registrado");
      }
      
      return user as User;
    } catch (error) {
      console.log("[AUTH] Error: El token JWT no es válido o ha expirado");
      throw ForbiddenError("Sesión inválida");
    }
  }
}

export const sdk = new SDKServer();