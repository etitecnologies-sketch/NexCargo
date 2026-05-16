import { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-3xl font-bold text-white">NexCargo</h1>
          <p className="text-brand-300 mt-1">Central Operacional de Logística</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Entrar na sua conta</h2>
          <LoginForm />
        </div>

        <p className="text-center text-brand-300 text-sm mt-6">
          © {new Date().getFullYear()} NexCargo. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
