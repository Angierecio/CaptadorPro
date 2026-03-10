import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Lock, ArrowRight } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        window.location.href = "/dashboard";
      } else {
        alert("Email o contraseña incorrectos");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-[#1a1a2e]">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">CaptadorPro</h1>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <input 
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none"
            placeholder="Email" required 
          />
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none"
            placeholder="Contraseña" required 
          />
          <Button type="submit" className="w-full h-12 rounded-xl bg-[#1a1a2e] text-white font-bold">
            Entrar ahora <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </form>

        <div className="relative my-8 text-center">
          <span className="bg-white px-4 text-gray-400 text-xs uppercase tracking-widest">O continúa con</span>
        </div>

        <Button 
          onClick={() => window.location.href = getLoginUrl()}
          variant="outline" className="w-full h-12 rounded-xl border-2 font-semibold"
        >
          Google Cloud
        </Button>
      </div>
    </div>
  );
}