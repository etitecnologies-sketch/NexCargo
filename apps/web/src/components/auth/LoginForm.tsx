"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json();
        setError(body.message ?? "E-mail ou senha incorretos.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Campo de e-mail */}
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="seu@email.com"
          className="input"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Campo de senha */}
      <div>
        <label htmlFor="password" className="label">Senha</label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="input pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Mensagem de erro geral */}
      {error && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
          <p className="text-danger-600 text-sm">{error}</p>
        </div>
      )}

      {/* Botão de entrar */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full justify-center"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>

      <div className="text-center">
        <a href="/forgot-password" className="text-brand-600 text-sm hover:underline">
          Esqueceu sua senha?
        </a>
      </div>
    </form>
  );
}
