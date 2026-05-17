import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { Package, Truck, Shield, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Entrar — NexCargo" };

const features = [
  { icon: Truck,  text: "Rastreamento em tempo real" },
  { icon: Zap,    text: "Notificações automáticas via WhatsApp" },
  { icon: Shield, text: "SLA e alertas inteligentes" },
];

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#0f172a" }}>

      {/* Painel esquerdo — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #172554 100%)" }}
      >
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
            <Package size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">NexCargo</span>
        </div>

        {/* Texto */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Central Operacional<br />
              <span style={{ color: "#60a5fa" }}>de Logística</span>
            </h2>
            <p className="mt-4 text-lg" style={{ color: "#94a3b8" }}>
              Gerencie pedidos, rastreie entregas e automatize notificações em um só lugar.
            </p>
          </div>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}>
                  <Icon size={15} style={{ color: "#60a5fa" }} />
                </div>
                <span className="text-sm" style={{ color: "#cbd5e1" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs" style={{ color: "#475569" }}>
          © {new Date().getFullYear()} NexCargo. Todos os direitos reservados.
        </p>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#f8fafc" }}>
        <div className="w-full max-w-md">

          {/* Logo mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
              <Package size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: "#0f172a" }}>NexCargo</span>
          </div>

          {/* Card */}
          <div className="rounded-2xl p-8" style={{
            background: "#fff",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08)",
            border: "1px solid #e2e8f0",
          }}>
            <div className="mb-7">
              <h1 className="text-2xl font-bold" style={{ color: "#0f172a" }}>Bem-vindo de volta</h1>
              <p className="mt-1 text-sm" style={{ color: "#64748b" }}>Entre com suas credenciais para acessar</p>
            </div>
            <LoginForm />
          </div>

          <p className="mt-6 text-center text-xs" style={{ color: "#94a3b8" }}>
            Problemas para entrar?{" "}
            <a href="/forgot-password" style={{ color: "#3b82f6" }} className="hover:underline">
              Recuperar senha
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
