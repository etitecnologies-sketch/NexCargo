"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  password: z.string().min(8, "Mínimo de 8 caracteres"),
  confirm:  z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "As senhas não coincidem",
  path: ["confirm"],
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ password }: FormData) {
    setApiError(null);
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setApiError(error.message); return; }
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">Nova senha</label>
        <div className="relative">
          <input
            type={showPwd ? "text" : "password"}
            className="input pr-10"
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
          />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-danger-500 text-xs mt-1">{errors.password.message}</p>}
      </div>
      <div>
        <label className="label">Confirmar senha</label>
        <input type="password" className="input" placeholder="Repita a senha" {...register("confirm")} />
        {errors.confirm && <p className="text-danger-500 text-xs mt-1">{errors.confirm.message}</p>}
      </div>
      {apiError && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
          <p className="text-danger-600 text-sm">{apiError}</p>
        </div>
      )}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
        {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : "Salvar nova senha"}
      </button>
    </form>
  );
}
