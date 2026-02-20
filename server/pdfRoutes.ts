import { Router, Request, Response } from "express";
import { getPropertyById, getUserByOpenId } from "./db";
import { generatePropertyPdf, PropertyPdfData } from "./pdfGenerator";
import { sdk } from "./_core/sdk";

export function registerPdfRoutes(app: Router) {
  // GET /api/properties/:id/pdf — genera y descarga la ficha PDF de una propiedad
  app.get("/api/properties/:id/pdf", async (req: Request, res: Response) => {
    try {
      // Verificar autenticación
      let openId: string;
      try {
        const user = await sdk.authenticateRequest(req);
        openId = user.openId;
      } catch {
        res.status(401).json({ error: "No autorizado. Inicia sesión para descargar fichas." });
        return;
      }

      const propertyId = parseInt(req.params.id);
      if (isNaN(propertyId)) {
        res.status(400).json({ error: "ID de propiedad inválido" });
        return;
      }

      const property = await getPropertyById(propertyId);
      if (!property) {
        res.status(404).json({ error: "Propiedad no encontrada" });
        return;
      }

      // Obtener datos del agente
      const agent = await getUserByOpenId(openId);

      // Parsear imágenes
      let images: string[] = [];
      try {
        if (property.images) {
          images = typeof property.images === "string"
            ? JSON.parse(property.images)
            : (property.images as string[]);
        }
      } catch { images = []; }

      const pdfData: PropertyPdfData = {
        id: property.id,
        title: property.title,
        address: property.address,
        city: property.city,
        district: property.district,
        province: property.province,
        postalCode: property.postalCode,
        propertyType: property.propertyType,
        operationType: property.operationType,
        price: property.price,
        squareMeters: property.squareMeters,
        rooms: property.rooms,
        bathrooms: property.bathrooms,
        floor: property.floor,
        hasElevator: property.hasElevator,
        hasParking: property.hasParking,
        hasTerrace: property.hasTerrace,
        hasPool: property.hasPool,
        hasGarden: property.hasGarden,
        hasAirConditioning: property.hasAirConditioning,
        energyCertificate: property.energyCertificate,
        yearBuilt: property.yearBuilt,
        condition: property.condition,
        description: property.description,
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
        ownerEmail: property.ownerEmail,
        ownerType: property.ownerType,
        sourcePortal: property.sourcePortal,
        images,
        agentName: agent?.name ?? undefined,
        agentEmail: agent?.email ?? undefined,
        agencyName: (agent as any)?.agency ?? undefined,
      };

      const pdfBuffer = await generatePropertyPdf(pdfData);

      const safeTitle = (property.title || `propiedad-${property.id}`)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 60);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="ficha-${safeTitle}.pdf"`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (err) {
      console.error("[PDF] Error generando PDF:", err);
      res.status(500).json({ error: "Error al generar el PDF. Inténtalo de nuevo." });
    }
  });
}
