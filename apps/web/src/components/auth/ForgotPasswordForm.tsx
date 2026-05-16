"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ email }: FormData) {
    const supabase = getSupabaseClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-50">
          <CheckCircle2 size={28} className="text-success-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-800">E-mail enviado!</p>
          <p className="text-gray-500 text-sm mt-1">
            Verifique a caixa de entrada de <strong>{getValues("email")}</strong>.
          </p>
        </div>
        <Link href="/login" className="btn-secondary w-full justify-center">
          <ArrowLeft size={15} /> Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label">E-mail</label>
        <input type="email" className="input" placeholder="seu@email.com" {...register("email")} />
        {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center">
        {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Enviando...</> : "Enviar link de recuperação"}
      </button>
      <div className="text-center">
        <Link href="/login" className="text-brand-600 text-sm hover:underline flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> Voltar ao login
        </Link>
      </div>
    </form>
  );
}
