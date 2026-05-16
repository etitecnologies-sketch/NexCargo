"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCreateCustomer } from "@/hooks/useCustomers";

const schema = z.object({
  name:     z.string().min(2, "Nome obrigatório"),
  document: z.string().optional(),
  email:    z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone:    z.string().optional(),
  address: z.object({
    zip:          z.string().optional(),
    street:       z.string().optional(),
    number:       z.string().optional(),
    complement:   z.string().optional(),
    neighborhood: z.string().optional(),
    city:         z.string().optional(),
    state:        z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function NewCustomerForm() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateCustomer();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      const result = await mutateAsync(data);
      router.push(`/dashboard/customers/${result.data.id}`);
    } catch (err) {
      setError("root", { message: err instanceof Error ? err.message : "Erro ao salvar." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Dados Pessoais</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label">Nome completo <span className="text-danger-500">*</span></label>
            <input className="input" placeholder="João da Silva" {...register("name")} />
            {errors.name && <p className="text-danger-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">CPF / CNPJ</label>
            <input className="input" placeholder="000.000.000-00" {...register("document")} />
          </div>
          <div>
            <label className="label">Telefone / WhatsApp</label>
            <input className="input" placeholder="(11) 99999-0000" {...register("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">E-mail</label>
            <input className="input" type="email" placeholder="joao@email.com" {...register("email")} />
            {errors.email && <p className="text-danger-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-800">Endereço</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">CEP</label>
            <input className="input" placeholder="00000-000" {...register("address.zip")} />
          </div>
          <div>
            <label className="label">Estado (UF)</label>
            <input className="input uppercase" placeholder="SP" maxLength={2} {...register("address.state")} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Rua</label>
            <input className="input" placeholder="Rua das Flores" {...register("address.street")} />
          </div>
          <div>
            <label className="label">Número</label>
            <input className="input" placeholder="100" {...register("address.number")} />
          </div>
          <div>
            <label className="label">Complemento</label>
            <input className="input" placeholder="Apto 12" {...register("address.complement")} />
          </div>
          <div>
            <label className="label">Bairro</label>
            <input className="input" placeholder="Centro" {...register("address.neighborhood")} />
          </div>
          <div>
            <label className="label">Cidade</label>
            <input className="input" placeholder="São Paulo" {...register("address.city")} />
          </div>
        </div>
      </div>

      <div className="card">
        <label className="label">Observações</label>
        <textarea className="input resize-none" rows={3} placeholder="Notas internas sobre este cliente..." {...register("notes")} />
      </div>

      {errors.root && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
          <p className="text-danger-600 text-sm">{errors.root.message}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pb-4">
        <a href="/dashboard/customers" className="btn-secondary">Cancelar</a>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : "Salvar Cliente"}
        </button>
      </div>
    </form>
  );
}
