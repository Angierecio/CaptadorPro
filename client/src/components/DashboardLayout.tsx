import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  Settings,
  LogOut,
  PanelLeft,
  Bell,
  ChevronRight,
  Home,
  UserCircle,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", description: "Métricas y resumen" },
  { icon: Building2, label: "Propiedades", path: "/properties", description: "Gestión de inmuebles" },
  { icon: Users, label: "CRM / Leads", path: "/leads", description: "Seguimiento de propietarios" },
  { icon: Search, label: "Captación", path: "/scraping", description: "Motor de scraping" },
  { icon: UserCircle, label: "Agentes", path: "/agents", description: "Gestión del equipo" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 260;
const MIN_WIDTH = 200;
const MAX_WIDTH = 400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;

  if (!user) {
    // Redirigir a la landing page en lugar de mostrar pantalla de login
    window.location.href = "/";
    return <DashboardLayoutSkeleton />;
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const activeMenuItem = menuItems.find(
    item => item.path === "/" ? location === "/" : location.startsWith(item.path)
  );

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  return (
    <>
      {/* Sidebar */}
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          {/* Header */}
          <SidebarHeader className="h-16 border-b border-sidebar-border/50">
            <div className="flex items-center gap-3 px-3 h-full">
              <button
                onClick={toggleSidebar}
                className="h-9 w-9 flex items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring shrink-0"
                style={{ background: "oklch(0.30 0.12 240)" }}
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" style={{ color: "oklch(0.92 0.01 240)" }} />
              </button>
              {!isCollapsed && (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(0.68 0.17 85)" }}>
                    <Home className="w-3.5 h-3.5" style={{ color: "oklch(0.15 0.06 240)" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate leading-none" style={{ color: "oklch(0.98 0.005 240)" }}>
                      PropTech
                    </p>
                    <p className="text-xs truncate mt-0.5" style={{ color: "oklch(0.65 0.05 240)" }}>
                      Captación Pro
                    </p>
                  </div>
                </div>
              )}
            </div>
          </SidebarHeader>

          {/* Navigation */}
          <SidebarContent className="gap-0 py-3">
            <SidebarMenu className="px-2 space-y-0.5">
              {menuItems.map(item => {
                const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="h-10 rounded-xl transition-all font-normal group"
                    >
                      <item.icon
                        className="h-4 w-4 shrink-0 transition-colors"
                        style={{ color: isActive ? "oklch(0.68 0.17 85)" : "oklch(0.65 0.05 240)" }}
                      />
                      <span
                        className="font-medium text-sm"
                        style={{ color: isActive ? "oklch(0.98 0.005 240)" : "oklch(0.75 0.04 240)" }}
                      >
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          {/* Footer */}
          <SidebarFooter className="p-3 border-t border-sidebar-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-sidebar-accent/60 transition-colors w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-8 w-8 shrink-0 border-2" style={{ borderColor: "oklch(0.68 0.17 85)" }}>
                    <AvatarFallback className="text-xs font-semibold" style={{ background: "oklch(0.30 0.12 240)", color: "oklch(0.98 0.005 240)" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-none" style={{ color: "oklch(0.92 0.01 240)" }}>
                        {user?.name || "Agente"}
                      </p>
                      <p className="text-xs truncate mt-1" style={{ color: "oklch(0.55 0.04 240)" }}>
                        {user?.role === "admin" ? "Administrador" : "Agente"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52" side="top">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Resize handle */}
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => { if (!isCollapsed) setIsResizing(true); }}
          style={{ zIndex: 50 }}
        />
      </div>

      {/* Main content */}
      <SidebarInset>
        {/* Mobile header */}
        {isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 rounded-lg" />
              <span className="font-medium text-sm">{activeMenuItem?.label ?? "Menú"}</span>
            </div>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        )}

        {/* Desktop top bar */}
        {!isMobile && (
          <div className="flex border-b h-14 items-center justify-between bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>PropTech Captación</span>
              {activeMenuItem && (
                <>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">{activeMenuItem.label}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "admin" && (
                <Badge variant="secondary" className="text-xs font-medium" style={{ background: "oklch(0.68 0.17 85)", color: "oklch(0.15 0.06 240)" }}>
                  Admin
                </Badge>
              )}
              <Avatar className="h-8 w-8 border-2" style={{ borderColor: "oklch(0.28 0.12 240)" }}>
                <AvatarFallback className="text-xs font-semibold" style={{ background: "oklch(0.28 0.12 240)", color: "oklch(0.98 0.005 240)" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
