import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Nova Senha" };

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">📦</span>
          <h1 className="text-3xl font-bold text-white mt-3">NexCargo</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Criar nova senha</h2>
          <p className="text-gray-500 text-sm mb-6">Escolha uma senha segura para sua conta.</p>
          <ResetPasswordForm />
        </div>
      </div>
    </main>
  );
}
