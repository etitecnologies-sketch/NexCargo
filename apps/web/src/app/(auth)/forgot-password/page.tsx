import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Recuperar Senha" };

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">📦</span>
          </div>
          <h1 className="text-3xl font-bold text-white">NexCargo</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Recuperar senha</h2>
          <p className="text-gray-500 text-sm mb-6">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
