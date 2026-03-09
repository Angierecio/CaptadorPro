import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Scraping from "./pages/Scraping";
import Agents from "./pages/Agents";
import Auth from "./pages/Auth"; // Importamos tu nueva página de Login

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={Home} />
        <Route path="/properties" component={Properties} />
        <Route path="/properties/:id" component={PropertyDetail} />
        <Route path="/leads" component={Leads} />
        <Route path="/leads/:id" component={LeadDetail} />
        <Route path="/scraping" component={Scraping} />
        <Route path="/agents" component={Agents} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Landing pública — visible para todos */}
      <Route path="/" component={Landing} />

      {/* NUEVA RUTA: Página de Login/Auth */}
      <Route path="/login" component={Auth} />

      {/* Rutas del dashboard — requieren autenticación */}
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/properties" component={DashboardRoutes} />
      <Route path="/properties/:id" component={DashboardRoutes} />
      <Route path="/leads" component={DashboardRoutes} />
      <Route path="/leads/:id" component={DashboardRoutes} />
      <Route path="/scraping" component={DashboardRoutes} />
      <Route path="/agents" component={DashboardRoutes} />
      
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;