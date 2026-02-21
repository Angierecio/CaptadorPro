import { getLoginUrl } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import {
  Building2,
  Zap,
  Users,
  FileText,
  BarChart3,
  Search,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Shield,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const NAVY = "oklch(0.22 0.10 240)";
const NAVY_LIGHT = "oklch(0.29 0.13 240)";
const GOLD = "oklch(0.78 0.15 80)";

export default function Landing() {
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && user) {
      window.location.href = "/dashboard";
    }
  }, [user, loading]);

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span style={{ color: NAVY }}>Captador</span>
              <span style={{ color: GOLD }}>Pro</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cómo funciona</a>
            <a href="#caracteristicas" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Características</a>
            <a href="#precios" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Precios</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="text-sm font-medium transition-colors hidden sm:block"
              style={{ color: NAVY }}
            >
              Iniciar sesión
            </button>
            <Button
              onClick={handleLogin}
              size="sm"
              className="rounded-full px-5 text-white font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ background: NAVY }}
            >
              Empezar gratis
            </Button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, #eef2ff 0%, #f0f7ff 50%, #fafbff 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 border" style={{ background: "rgba(37,99,235,0.08)", borderColor: "rgba(37,99,235,0.2)", color: NAVY }}>
            <Zap className="w-4 h-4" style={{ color: GOLD }} />
            Captación inmobiliaria automatizada con IA
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
            Capta más propiedades{" "}
            <span style={{ color: NAVY }}>en menos tiempo</span>{" "}
            con inteligencia artificial
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            CaptadorPro automatiza la búsqueda de propiedades en Idealista, Fotocasa y otros portales. Gestiona tus leads, genera fichas PDF y cierra más acuerdos sin esfuerzo manual.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-14">
            <Button
              onClick={handleLogin}
              size="lg"
              className="rounded-full px-8 h-14 text-base font-bold text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              style={{ background: NAVY }}
            >
              Comenzar gratis — 15 días de prueba
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a href="#como-funciona" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              Ver cómo funciona <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { value: "+500", label: "Propiedades captadas/mes" },
              { value: "3x", label: "Más captaciones que manual" },
              { value: "15 min", label: "Para configurar y empezar" },
              { value: "24/7", label: "Captación automática" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl md:text-3xl font-extrabold mb-1" style={{ color: NAVY }}>{stat.value}</div>
                <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-white" style={{ clipPath: "ellipse(55% 100% at 50% 100%)" }} />
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section id="como-funciona" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              ¿Cómo funciona CaptadorPro?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              En tres pasos sencillos, el sistema trabaja por ti mientras tú te concentras en cerrar acuerdos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Configura tus fuentes",
                desc: "Añade las URLs de búsqueda de Idealista, Fotocasa u otros portales con los filtros de tu zona, precio y tipo de inmueble.",
              },
              {
                step: "02",
                icon: Zap,
                title: "El sistema capta solo",
                desc: "CaptadorPro extrae automáticamente todas las propiedades con sus datos, imágenes y contacto del propietario usando IA.",
              },
              {
                step: "03",
                icon: TrendingUp,
                title: "Gestiona y cierra",
                desc: "Revisa las propiedades captadas, gestiona los leads en el CRM, genera fichas PDF y contacta a los propietarios.",
              },
            ].map((item) => (
              <div key={item.step} className="relative p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: NAVY }}>
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 mt-2" style={{ background: "oklch(0.22 0.10 240 / 0.08)" }}>
                  <item.icon className="w-6 h-6" style={{ color: NAVY }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section id="caracteristicas" className="py-20" style={{ background: "#f8faff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              ¿Por qué CaptadorPro vale la pena?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Todo lo que necesita un agente inmobiliario profesional en una sola plataforma.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: "Scraping automático con IA",
                desc: "Extrae propiedades de Idealista, Fotocasa y otros portales de forma automática, con todos los datos estructurados.",
                color: NAVY,
                bg: "oklch(0.22 0.10 240 / 0.08)",
              },
              {
                icon: Users,
                title: "CRM integrado",
                desc: "Gestiona leads, registra interacciones, asigna propiedades a agentes y lleva el historial completo de cada propietario.",
                color: "#16a34a",
                bg: "rgba(22,163,74,0.08)",
              },
              {
                icon: FileText,
                title: "Fichas PDF profesionales",
                desc: "Genera fichas de propiedades en PDF con un clic, listas para enviar a clientes interesados con diseño elegante.",
                color: "#d97706",
                bg: "rgba(217,119,6,0.08)",
              },
              {
                icon: BarChart3,
                title: "Dashboard con métricas",
                desc: "Visualiza el rendimiento de tu equipo: propiedades captadas, tasa de conversión, evolución mensual y más.",
                color: "#7c3aed",
                bg: "rgba(124,58,237,0.08)",
              },
              {
                icon: MapPin,
                title: "Búsqueda avanzada",
                desc: "Filtra propiedades por zona, precio, tipo, estado y características. Encuentra exactamente lo que busca cada cliente.",
                color: "#0891b2",
                bg: "rgba(8,145,178,0.08)",
              },
              {
                icon: Shield,
                title: "Multi-agente con roles",
                desc: "Gestiona todo tu equipo desde una sola plataforma. Asigna propiedades, controla accesos y mide el rendimiento individual.",
                color: "#dc2626",
                bg: "rgba(220,38,38,0.08)",
              },
            ].map((feat) => (
              <div key={feat.title} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: feat.bg }}>
                  <feat.icon className="w-5 h-5" style={{ color: feat.color }} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feat.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFICIOS CLAVE ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Deja de buscar propiedades manualmente.{" "}
                <span style={{ color: NAVY }}>Deja que CaptadorPro lo haga por ti.</span>
              </h2>
              <p className="text-gray-500 text-lg mb-8 leading-relaxed">
                El agente inmobiliario promedio pierde 3 horas al día buscando propiedades en portales. Con CaptadorPro, ese tiempo lo dedicas a lo que realmente importa: hablar con propietarios y cerrar acuerdos.
              </p>
              <div className="space-y-4">
                {[
                  "Captación automática 24 horas al día, 7 días a la semana",
                  "Datos completos: precio, fotos, descripción y contacto del propietario",
                  "Notificaciones inmediatas cuando se captan nuevas oportunidades",
                  "Historial completo de cada propiedad y cada propietario contactado",
                  "Fichas PDF profesionales generadas en un solo clic",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: "#16a34a" }} />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleLogin}
                size="lg"
                className="mt-8 rounded-full px-8 h-12 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                style={{ background: NAVY }}
              >
                Empezar prueba gratuita
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, value: "3h/día", label: "Tiempo ahorrado por agente", color: NAVY, bg: "oklch(0.22 0.10 240 / 0.08)" },
                { icon: TrendingUp, value: "+180%", label: "Más propiedades captadas", color: "#16a34a", bg: "rgba(22,163,74,0.08)" },
                { icon: Building2, value: "500+", label: "Propiedades al mes", color: "#d97706", bg: "rgba(217,119,6,0.08)" },
                { icon: Star, value: "4.9/5", label: "Valoración de agentes", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
              ].map((stat) => (
                <div key={stat.label} className="p-6 rounded-2xl border border-gray-100 text-center shadow-sm" style={{ background: stat.bg }}>
                  <stat.icon className="w-7 h-7 mx-auto mb-3" style={{ color: stat.color }} />
                  <div className="text-2xl font-extrabold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs text-gray-500 leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIOS ── */}
      <section className="py-20" style={{ background: "#f8faff" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Lo que dicen los agentes
            </h2>
            <p className="text-gray-500 text-lg">Agentes inmobiliarios que ya usan CaptadorPro cada día.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Carlos Martínez",
                role: "Agente independiente, Madrid",
                text: "Antes tardaba 2 horas al día buscando en Idealista. Ahora CaptadorPro me trae las propiedades solas y yo me dedico a llamar a los propietarios. Tripling mis captaciones en el primer mes.",
                stars: 5,
              },
              {
                name: "Laura Sánchez",
                role: "Directora de agencia, Barcelona",
                text: "Lo que más me gusta es el CRM integrado. Antes usaba Excel para llevar el seguimiento. Ahora todo está en un solo lugar y mi equipo de 5 agentes trabaja de forma coordinada.",
                stars: 5,
              },
              {
                name: "Miguel Torres",
                role: "Agente inmobiliario, Valencia",
                text: "Las fichas PDF son un antes y un después. Las envío a los clientes por WhatsApp y la impresión que causan es brutal. Parece que tengo un equipo de diseño detrás.",
                stars: 5,
              },
            ].map((t) => (
              <div key={t.name} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: GOLD }} />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: NAVY }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Elige tu plan
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Empieza gratis durante 15 días. Sin tarjeta de crédito. Cancela cuando quieras.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Plan Agente */}
            <div className="p-8 rounded-2xl border-2 border-gray-200 bg-white">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Agente</h3>
                <p className="text-gray-500 text-sm">Para agentes independientes</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-gray-900">49€</span>
                <span className="text-gray-500 text-sm">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "1 agente incluido",
                  "Hasta 3 fuentes de captación",
                  "500 propiedades/mes",
                  "CRM de leads ilimitado",
                  "Fichas PDF ilimitadas",
                  "Soporte por email",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#16a34a" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button onClick={handleLogin} variant="outline" className="w-full h-11 rounded-full font-semibold border-2" style={{ borderColor: NAVY, color: NAVY }}>
                Empezar prueba gratuita
              </Button>
            </div>

            {/* Plan Agencia */}
            <div className="p-8 rounded-2xl border-2 text-white relative overflow-hidden" style={{ background: NAVY, borderColor: NAVY }}>
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold" style={{ background: GOLD, color: NAVY }}>
                MÁS POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">Agencia</h3>
                <p className="text-white/70 text-sm">Para equipos y agencias</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold">99€</span>
                <span className="text-white/70 text-sm">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Hasta 10 agentes",
                  "Fuentes ilimitadas",
                  "Propiedades ilimitadas",
                  "CRM avanzado con asignaciones",
                  "Fichas PDF con tu marca",
                  "Dashboard de rendimiento del equipo",
                  "Soporte prioritario",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-white" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={handleLogin}
                className="w-full h-11 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: GOLD, color: NAVY }}
              >
                Empezar prueba gratuita
              </Button>
            </div>
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            ¿Tienes un equipo grande? <button onClick={handleLogin} className="underline" style={{ color: NAVY }}>Contáctanos para un plan personalizado</button>
          </p>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 text-white text-center" style={{ background: `linear-gradient(160deg, ${NAVY} 0%, oklch(0.18 0.12 240) 100%)` }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-sm font-semibold mb-4 uppercase tracking-widest" style={{ color: GOLD }}>
            CaptadorPro
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
            ¿Listo para revolucionar tu captación inmobiliaria?
          </h2>
          <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
            Únete a los agentes que ya están usando CaptadorPro para encontrar las mejores oportunidades del mercado de forma automática.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleLogin}
              size="lg"
              className="rounded-full px-10 h-14 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
              style={{ background: GOLD, color: NAVY }}
            >
              Crear cuenta gratuita
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={handleLogin}
              size="lg"
              variant="outline"
              className="rounded-full px-10 h-14 text-base font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all"
            >
              Ver la plataforma
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NAVY }}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">
                  <span style={{ color: NAVY }}>Captador</span>
                  <span style={{ color: GOLD }}>Pro</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                La plataforma de captación inmobiliaria automatizada para agentes y agencias profesionales.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Plataforma</h4>
              <ul className="space-y-2">
                {["Características", "Precios", "Cómo funciona", "Iniciar sesión"].map((l) => (
                  <li key={l}>
                    <button onClick={handleLogin} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{l}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="w-4 h-4" />
                  hola@captadorpro.com
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="w-4 h-4" />
                  +34 600 000 000
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">© 2025 CaptadorPro. Todos los derechos reservados.</p>
            <p className="text-xs text-gray-400">captadorpro.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
