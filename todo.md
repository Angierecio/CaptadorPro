# PropTech Captación - TODO

## Base de Datos y Backend
- [x] Esquema de BD: tabla properties (propiedades captadas)
- [x] Esquema de BD: tabla leads (leads de propietarios)
- [x] Esquema de BD: tabla interactions (historial CRM)
- [x] Esquema de BD: tabla scraping_sources (fuentes de scraping)
- [x] Esquema de BD: tabla scraping_jobs (trabajos de scraping)
- [x] Esquema de BD: tabla property_assignments (asignaciones agente-propiedad)
- [x] Migraciones de BD con pnpm db:push
- [x] Helpers de consulta en server/db.ts
- [x] Router tRPC: properties (CRUD + búsqueda avanzada)
- [x] Router tRPC: leads (CRUD + seguimiento)
- [x] Router tRPC: interactions (historial)
- [x] Router tRPC: scraping (configuración y ejecución)
- [x] Router tRPC: agents (gestión de agentes)
- [x] Router tRPC: dashboard (métricas y estadísticas)
- [x] Motor de scraping con LLM para extracción de datos
- [x] Generador automático de fichas de propiedades

## Frontend - Sistema de Diseño
- [x] Paleta de colores elegante (azul marino / dorado / blanco)
- [x] Tipografía profesional (Inter + Playfair Display)
- [x] Tema global en index.css
- [x] DashboardLayout con sidebar de navegación
- [x] Componente de estadísticas (StatCard)
- [x] Componente de tabla avanzada con filtros

## Frontend - Módulos
- [x] Dashboard: métricas clave (propiedades, leads, conversiones)
- [x] Dashboard: gráficos de rendimiento (Recharts)
- [x] Dashboard: propiedades por fuente, tasa de conversión, evolución temporal
- [x] Módulo Propiedades: listado con filtros avanzados
- [x] Módulo Propiedades: vista detalle con ficha completa
- [x] Módulo Propiedades: búsqueda por ubicación, precio, tipo, estado
- [x] Módulo CRM: listado de leads con estados
- [x] Módulo CRM: detalle de lead con historial de interacciones
- [x] Módulo CRM: formulario de nueva interacción
- [x] Módulo Scraping: configuración de fuentes (Idealista, Fotocasa, etc.)
- [x] Módulo Scraping: ejecución manual y programada
- [x] Módulo Scraping: historial de trabajos y resultados
- [x] Módulo Agentes: listado y gestión de agentes
- [x] Módulo Agentes: estadísticas individuales por agente
- [x] Módulo Agentes: gestión de roles (admin/agente)
- [x] Página de login/landing elegante

## Pruebas y Entrega
- [x] Tests Vitest para routers principales (12 tests pasados)
- [x] Checkpoint final
- [x] Entrega al usuario

## Generación de Fichas PDF
- [x] Endpoint backend /api/properties/:id/pdf con puppeteer-core y chromium
- [x] Diseño elegante de la ficha PDF (azul marino, dorado, logo, datos completos)
- [x] Sección de contacto del propietario y agente responsable en el PDF
- [x] Galería de imágenes y equipamiento en el PDF
- [x] Botón "Descargar Ficha PDF" en la página de detalle de propiedad

## Notificaciones
- [x] Notificación automática al admin cuando un nuevo usuario se registra

## Landing Page de Ventas
- [x] Hero section con headline potente, subheadline y CTA de registro
- [x] Sección de métricas/estadísticas de impacto
- [x] Sección de características principales con iconos
- [x] Sección de cómo funciona (paso a paso)
- [x] Sección de beneficios por rol (agente independiente / agencia)
- [x] Sección de precios / prueba gratuita
- [x] Sección de testimonios
- [x] Footer con links y contacto
- [x] Navbar pública con botón de login/acceso
- [x] Enrutamiento: visitantes no autenticados ven landing, autenticados van al dashboard

## Portales Argentinos
- [x] Actualizar lista de portales inmobiliarios a los principales de Argentina (Buenos Aires)
