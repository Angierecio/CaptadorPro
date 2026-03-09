import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Lock, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Intentaremos entrar por la vía tradicional que suelen tener los SaaS de Manus
    console.log("Intentando entrar con:", email);
    // Aquí podrías añadir una llamada a /api/login si Manus dejó esa ruta lista
    alert("Vía Email: Estamos verificando si el servidor tiene activado el login manual.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ background: "oklch(0.22 0.10 240)" }}>
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">CaptadorPro</h1>
          <p className="text-gray-500 text-center mt-2 font-medium">Gestiona tus propiedades con IA</p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700 ml-1">Tu Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 ml-1">Contraseña</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 rounded-xl text-white font-bold text-base shadow-lg hover:shadow-indigo-200 transition-all" style={{ background: "oklch(0.22 0.10 240)" }}>
            Entrar ahora <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold tracking-widest">O continúa con</span></div>
        </div>

        <Button 
          onClick={() => window.location.href = getLoginUrl()}
          variant="outline"
          className="w-full h-12 rounded-xl border-2 border-gray-100 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Google Cloud
        </Button>
      </div>
    </div>
  );
}