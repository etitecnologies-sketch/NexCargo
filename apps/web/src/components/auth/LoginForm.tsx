"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type LoginData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError("E-mail ou senha incorretos. Tente novamente.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
  }

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "11px 12px 11px 40px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    color: "#0f172a",
    fontSize: "14px",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "inherit",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* Email */}
      <div>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          E-mail
        </label>
        <div style={{ position: "relative" }}>
          <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          <input
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            style={inputBase}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.boxShadow = "none";
            }}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.email.message}</p>
        )}
      </div>

      {/* Senha */}
      <div>
        <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
          Senha
        </label>
        <div style={{ position: "relative" }}>
          <Lock size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          <input
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            style={{ ...inputBase, paddingRight: "44px" }}
            onFocus={e => {
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = "#e2e8f0";
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.boxShadow = "none";
            }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.password.message}</p>
        )}
      </div>

      {/* Erro geral */}
      {error && (
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Botão entrar */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "12px",
          border: "none",
          background: isSubmitting ? "#93c5fd" : "linear-gradient(135deg, #2563eb, #4f46e5)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 700,
          cursor: isSubmitting ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          letterSpacing: "0.01em",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Entrando...
          </>
        ) : (
          "Entrar na plataforma"
        )}
      </button>

      <p style={{ textAlign: "center" }}>
        <a href="/forgot-password" style={{ color: "#3b82f6", fontSize: "13px", textDecoration: "none" }}>
          Esqueceu sua senha?
        </a>
      </p>
    </form>
  );
}
