import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function Auth() {
  const handleGoogleLogin = () => {
    // Esto te llevará al servidor de Railway que ya configuramos
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: "oklch(0.22 0.10 240)" }}>
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CaptadorPro</h1>
          <p className="text-gray-500 text-center mt-2">
            Ingresa para gestionar tus propiedades con IA
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-12 flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all rounded-xl font-semibold"
          >
            Continuar con Google
          </Button>
          
          <p className="text-xs text-gray-400 text-center mt-6">
            Acceso seguro mediante Google OAuth 2.0
          </p>
        </div>
      </div>
    </div>
  );
}