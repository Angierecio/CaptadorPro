import puppeteer from "puppeteer-core";

export interface PropertyPdfData {
  id: number;
  title?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  province?: string | null;
  postalCode?: string | null;
  propertyType?: string | null;
  operationType?: string | null;
  price?: string | null;
  squareMeters?: string | null;
  rooms?: number | null;
  bathrooms?: number | null;
  floor?: string | null;
  hasElevator?: boolean | null;
  hasParking?: boolean | null;
  hasTerrace?: boolean | null;
  hasPool?: boolean | null;
  hasGarden?: boolean | null;
  hasAirConditioning?: boolean | null;
  energyCertificate?: string | null;
  yearBuilt?: number | null;
  condition?: string | null;
  description?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  ownerType?: string | null;
  sourcePortal?: string | null;
  images?: string[] | null;
  agentName?: string | null;
  agentEmail?: string | null;
  agencyName?: string | null;
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  piso: "Piso", casa: "Casa", chalet: "Chalet", local: "Local Comercial",
  oficina: "Oficina", garaje: "Garaje", terreno: "Terreno", nave: "Nave Industrial", otro: "Otro",
};

const OPERATION_TYPE_LABELS: Record<string, string> = {
  venta: "Venta", alquiler: "Alquiler", alquiler_vacacional: "Alquiler Vacacional",
};

const CONDITION_LABELS: Record<string, string> = {
  nueva_construccion: "Nueva Construcción", buen_estado: "Buen Estado",
  a_reformar: "A Reformar", reformado: "Reformado",
};

function formatPrice(price?: string | null): string {
  if (!price) return "Precio a consultar";
  const num = parseFloat(price);
  if (isNaN(num)) return price;
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(num);
}

function buildHtml(p: PropertyPdfData): string {
  const title = p.title || `${PROPERTY_TYPE_LABELS[p.propertyType ?? ""] || "Propiedad"} en ${p.city || ""}`;
  const operation = OPERATION_TYPE_LABELS[p.operationType ?? ""] || "";
  const type = PROPERTY_TYPE_LABELS[p.propertyType ?? ""] || "";
  const condition = CONDITION_LABELS[p.condition ?? ""] || "";

  const amenities: string[] = [];
  if (p.hasElevator) amenities.push("Ascensor");
  if (p.hasParking) amenities.push("Garaje");
  if (p.hasTerrace) amenities.push("Terraza");
  if (p.hasPool) amenities.push("Piscina");
  if (p.hasGarden) amenities.push("Jardín");
  if (p.hasAirConditioning) amenities.push("Aire Acondicionado");

  const mainImage = p.images && p.images.length > 0 ? p.images[0] : null;
  const extraImages = p.images && p.images.length > 1 ? p.images.slice(1, 4) : [];

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ficha de Propiedad - ${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1a2744; background: #fff; font-size: 11pt; line-height: 1.5; }

    .header { background: linear-gradient(135deg, #0f1f3d 0%, #1a3460 100%); color: white; padding: 24px 36px; display: flex; justify-content: space-between; align-items: center; }
    .header-logo { width: 42px; height: 42px; background: #c9a84c; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; color: #0f1f3d; margin-right: 14px; }
    .header-brand { display: flex; align-items: center; }
    .header-brand-name { font-size: 15pt; font-weight: 700; letter-spacing: 0.3px; }
    .header-brand-sub { font-size: 8pt; color: rgba(255,255,255,0.6); margin-top: 1px; letter-spacing: 1.5px; text-transform: uppercase; }
    .header-badge { background: #c9a84c; color: #0f1f3d; padding: 6px 18px; border-radius: 20px; font-size: 9pt; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }
    .gold-divider { height: 3px; background: linear-gradient(90deg, #c9a84c, #e8c97a, #c9a84c); }

    .hero { position: relative; height: 250px; background: #e8edf5; overflow: hidden; }
    .hero img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(15,31,61,0.88)); padding: 20px 36px 18px; color: white; }
    .hero-price { font-size: 26pt; font-weight: 700; color: #c9a84c; line-height: 1; }
    .hero-title { font-size: 14pt; font-weight: 600; margin-top: 4px; }
    .hero-address { font-size: 9pt; color: rgba(255,255,255,0.72); margin-top: 3px; }
    .hero-no-image { display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column; gap: 8px; color: #8a9bb5; font-size: 10pt; }

    .content { padding: 24px 36px; }

    .pills-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; }
    .pill { background: #f0f4f9; border: 1px solid #d8e2ef; border-radius: 8px; padding: 7px 14px; font-size: 9.5pt; font-weight: 600; color: #1a2744; }

    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px; }

    .section { margin-bottom: 18px; }
    .section-title { font-size: 11pt; font-weight: 700; color: #0f1f3d; border-bottom: 2px solid #c9a84c; padding-bottom: 4px; margin-bottom: 10px; display: inline-block; }

    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f0f4f9; }
    .detail-label { font-size: 8.5pt; color: #6b7fa3; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px; }
    .detail-value { font-size: 9.5pt; font-weight: 600; color: #1a2744; }

    .amenities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
    .amenity { display: flex; align-items: center; gap: 6px; padding: 7px 10px; background: #f0f4f9; border-radius: 6px; font-size: 9pt; font-weight: 500; }
    .amenity-check { color: #c9a84c; font-weight: 700; }

    .contact-box { background: linear-gradient(135deg, #0f1f3d 0%, #1a3460 100%); color: white; border-radius: 10px; padding: 18px 20px; }
    .contact-box .section-title { color: #c9a84c; border-bottom-color: rgba(201,168,76,0.4); }
    .contact-item { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .contact-item:last-child { border-bottom: none; }
    .contact-icon { font-size: 12pt; margin-top: 1px; }
    .contact-label { color: rgba(255,255,255,0.5); font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.4px; }
    .contact-value { color: white; font-weight: 600; font-size: 9.5pt; }

    .agent-box { background: #f8fafc; border: 1px solid #d8e2ef; border-radius: 10px; padding: 18px 20px; margin-top: 12px; }

    .description-text { font-size: 9.5pt; color: #3d4f6e; line-height: 1.7; background: #f8fafc; border-left: 3px solid #c9a84c; padding: 10px 14px; border-radius: 0 6px 6px 0; }

    .images-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .images-grid img { width: 100%; height: 85px; object-fit: cover; border-radius: 6px; }

    .footer { background: #0f1f3d; color: rgba(255,255,255,0.5); text-align: center; padding: 12px 36px; font-size: 7.5pt; display: flex; justify-content: space-between; align-items: center; }
    .footer-brand { color: #c9a84c; font-weight: 600; font-size: 8.5pt; }
  </style>
</head>
<body>

<div class="header">
  <div class="header-brand">
    <div class="header-logo">P</div>
    <div>
      <div class="header-brand-name">${p.agencyName || "PropTech Captación"}</div>
      <div class="header-brand-sub">Ficha de Propiedad</div>
    </div>
  </div>
  <div class="header-badge">${operation || "Propiedad"}</div>
</div>
<div class="gold-divider"></div>

<div class="hero">
  ${mainImage
    ? `<img src="${mainImage}" alt="Imagen principal" />`
    : `<div class="hero-no-image"><div style="font-size:40px">🏠</div><div>Sin imagen disponible</div></div>`
  }
  <div class="hero-overlay">
    <div class="hero-price">${formatPrice(p.price)}</div>
    <div class="hero-title">${title}</div>
    <div class="hero-address">${[p.address, p.district, p.city, p.province].filter(Boolean).join(" · ")}</div>
  </div>
</div>

<div class="content">

  <div class="pills-row">
    ${p.rooms ? `<div class="pill">🛏 ${p.rooms} hab.</div>` : ""}
    ${p.bathrooms ? `<div class="pill">🚿 ${p.bathrooms} baños</div>` : ""}
    ${p.squareMeters ? `<div class="pill">📐 ${p.squareMeters} m²</div>` : ""}
    ${p.floor ? `<div class="pill">🏢 Planta ${p.floor}</div>` : ""}
    ${type ? `<div class="pill">🏠 ${type}</div>` : ""}
    ${condition ? `<div class="pill">✨ ${condition}</div>` : ""}
    ${p.energyCertificate ? `<div class="pill">⚡ Cert. ${p.energyCertificate.toUpperCase()}</div>` : ""}
  </div>

  <div class="two-col">
    <div>
      <div class="section">
        <div class="section-title">Detalles de la Propiedad</div>
        <div class="details-grid">
          ${p.propertyType ? `<div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">${type}</span></div>` : ""}
          ${p.operationType ? `<div class="detail-row"><span class="detail-label">Operación</span><span class="detail-value">${operation}</span></div>` : ""}
          ${p.squareMeters ? `<div class="detail-row"><span class="detail-label">Superficie</span><span class="detail-value">${p.squareMeters} m²</span></div>` : ""}
          ${p.rooms ? `<div class="detail-row"><span class="detail-label">Habitaciones</span><span class="detail-value">${p.rooms}</span></div>` : ""}
          ${p.bathrooms ? `<div class="detail-row"><span class="detail-label">Baños</span><span class="detail-value">${p.bathrooms}</span></div>` : ""}
          ${p.floor ? `<div class="detail-row"><span class="detail-label">Planta</span><span class="detail-value">${p.floor}</span></div>` : ""}
          ${p.yearBuilt ? `<div class="detail-row"><span class="detail-label">Año construcción</span><span class="detail-value">${p.yearBuilt}</span></div>` : ""}
          ${p.condition ? `<div class="detail-row"><span class="detail-label">Estado</span><span class="detail-value">${condition}</span></div>` : ""}
          ${p.postalCode ? `<div class="detail-row"><span class="detail-label">Código postal</span><span class="detail-value">${p.postalCode}</span></div>` : ""}
          ${p.energyCertificate ? `<div class="detail-row"><span class="detail-label">Cert. energético</span><span class="detail-value">${p.energyCertificate.toUpperCase()}</span></div>` : ""}
        </div>
      </div>
      ${amenities.length > 0 ? `
      <div class="section">
        <div class="section-title">Equipamiento</div>
        <div class="amenities-grid">
          ${amenities.map(a => `<div class="amenity"><span class="amenity-check">✓</span>${a}</div>`).join("")}
        </div>
      </div>` : ""}
    </div>

    <div>
      ${(p.ownerName || p.ownerPhone || p.ownerEmail) ? `
      <div class="section">
        <div class="contact-box">
          <div class="section-title">Contacto del Propietario</div>
          ${p.ownerName ? `<div class="contact-item"><span class="contact-icon">👤</span><div><div class="contact-label">Nombre</div><div class="contact-value">${p.ownerName}</div></div></div>` : ""}
          ${p.ownerPhone ? `<div class="contact-item"><span class="contact-icon">📞</span><div><div class="contact-label">Teléfono</div><div class="contact-value">${p.ownerPhone}</div></div></div>` : ""}
          ${p.ownerEmail ? `<div class="contact-item"><span class="contact-icon">✉️</span><div><div class="contact-label">Email</div><div class="contact-value">${p.ownerEmail}</div></div></div>` : ""}
          ${p.ownerType ? `<div class="contact-item"><span class="contact-icon">🏷️</span><div><div class="contact-label">Tipo</div><div class="contact-value" style="text-transform:capitalize">${p.ownerType}</div></div></div>` : ""}
        </div>
      </div>` : ""}
      ${p.agentName ? `
      <div class="agent-box">
        <div class="section-title">Agente Responsable</div>
        <div class="contact-item" style="border-bottom:1px solid #e8edf5">
          <span class="contact-icon">🧑‍💼</span>
          <div><div class="contact-label" style="color:#6b7fa3">Agente</div><div class="contact-value" style="color:#1a2744">${p.agentName}</div></div>
        </div>
        ${p.agentEmail ? `<div class="contact-item" style="border-bottom:none"><span class="contact-icon">✉️</span><div><div class="contact-label" style="color:#6b7fa3">Email</div><div class="contact-value" style="color:#1a2744">${p.agentEmail}</div></div></div>` : ""}
      </div>` : ""}
    </div>
  </div>

  ${p.description ? `
  <div class="section">
    <div class="section-title">Descripción</div>
    <div class="description-text">${p.description}</div>
  </div>` : ""}

  ${extraImages.length > 0 ? `
  <div class="section">
    <div class="section-title">Galería de Imágenes</div>
    <div class="images-grid">
      ${extraImages.map(img => `<img src="${img}" alt="Imagen" />`).join("")}
    </div>
  </div>` : ""}

</div>

<div class="gold-divider"></div>
<div class="footer">
  <div class="footer-brand">${p.agencyName || "PropTech Captación"}</div>
  <div>Ficha generada el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })} · Ref. #${p.id}</div>
  <div>Documento confidencial · Uso exclusivo del agente</div>
</div>

</body>
</html>`;
}

export async function generatePropertyPdf(property: PropertyPdfData): Promise<Buffer> {
  const html = buildHtml(property);

  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
    ],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30000 });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
