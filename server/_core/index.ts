import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerPdfRoutes } from "../pdfRoutes";

function isPortAvailable(port: number ): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 1. CONFIGURACIÓN DE CORS
  app.use(cors({
    origin: ["https://www.captadorpro.com", "https://captadorpro.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
  } ));

  // 2. CONFIANZA EN PROXY (Necesario para cookies en Railway/Vercel)
  app.set("trust proxy", 1);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);
  registerPdfRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 🚀 CORRECCIÓN DEL PUERTO PARA RAILWAY
  // En producción usamos el puerto de Railway directamente. En desarrollo buscamos uno libre.
  const port = process.env.NODE_ENV === "production"
    ? parseInt(process.env.PORT || "8080")
    : await findAvailablePort(3000);

  // 🚩 Escuchamos en "0.0.0.0" para que Railway pueda acceder externamente
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
