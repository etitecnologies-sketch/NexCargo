"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Loader2, User, MapPin, Package, DollarSign } from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrders";

const addressSchema = z.object({
  zip:          z.string().min(8, "CEP inválido"),
  street:       z.string().min(2, "Rua obrigatória"),
  number:       z.string().optional(),
  complement:   z.string().optional(),
  neighborhood: z.string().optional(),
  city:         z.string().min(2, "Cidade obrigatória"),
  state:        z.string().length(2, "Use a sigla do estado (ex: SP)"),
});

const newOrderSchema = z.object({
  sender_name:         z.string().min(2, "Nome do remetente obrigatório"),
  sender_phone:        z.string().optional(),
  recipient_name:      z.string().min(2, "Nome do destinatário obrigatório"),
  recipient_phone:     z.string().optional(),
  origin_address:      addressSchema,
  destination_address: addressSchema,
  description:         z.string().optional(),
  weight_kg:           z.coerce.number().positive("Peso deve ser positivo").optional(),
  declared_value:      z.coerce.number().nonnegative("Valor não pode ser negativo").optional(),
  freight_value:       z.coerce.number().nonnegative("Frete não pode ser negativo").default(0),
  estimated_delivery_date: z.string().optional(),
  notes:               z.string().optional(),
});

type NewOrderData = z.infer<typeof newOrderSchema>;

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-2 rounded-lg bg-brand-50">
        <Icon size={16} className="text-brand-600" />
      </div>
      <h2 className="font-semibold text-gray-800">{title}</h2>
    </div>
  );
}

function Field({
  label, error, children, required,
}: {
  label: string; error?: string; children: React.ReactNode; required?: boolean;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-danger-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-danger-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function AddressFields({
  prefix,
  register,
  errors,
}: {
  prefix: "origin_address" | "destination_address";
  register: ReturnType<typeof useForm<NewOrderData>>["register"];
  errors: ReturnType<typeof useForm<NewOrderData>>["formState"]["errors"];
}) {
  const e = errors[prefix] as Record<string, { message?: string }> | undefined;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="CEP" error={e?.zip?.message} required>
        <input className="input" placeholder="00000-000" maxLength={9} {...register(`${prefix}.zip`)} />
      </Field>
      <Field label="Estado (UF)" error={e?.state?.message} required>
        <input className="input uppercase" placeholder="SP" maxLength={2} {...register(`${prefix}.state`)} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Rua / Logradouro" error={e?.street?.message} required>
          <input className="input" placeholder="Rua das Flores" {...register(`${prefix}.street`)} />
        </Field>
      </div>
      <Field label="Número" error={e?.number?.message}>
        <input className="input" placeholder="100" {...register(`${prefix}.number`)} />
      </Field>
      <Field label="Complemento" error={e?.complement?.message}>
        <input className="input" placeholder="Apto 12" {...register(`${prefix}.complement`)} />
      </Field>
      <Field label="Bairro" error={e?.neighborhood?.message}>
        <input className="input" placeholder="Centro" {...register(`${prefix}.neighborhood`)} />
      </Field>
      <Field label="Cidade" error={e?.city?.message} required>
        <input className="input" placeholder="São Paulo" {...register(`${prefix}.city`)} />
      </Field>
    </div>
  );
}

export function NewOrderForm() {
  const router = useRouter();
  const { mutateAsync: createOrder, isPending } = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<NewOrderData>({ resolver: zodResolver(newOrderSchema) });

  async function onSubmit(data: NewOrderData) {
    try {
      const result = await createOrder(data);
      router.push(`/dashboard/orders/${result.data.id}`);
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Erro ao criar pedido.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Remetente */}
      <div className="card">
        <SectionTitle icon={User} title="Remetente" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nome completo" error={errors.sender_name?.message} required>
              <input className="input" placeholder="João da Silva" {...register("sender_name")} />
            </Field>
          </div>
          <Field label="WhatsApp" error={errors.sender_phone?.message}>
            <input className="input" placeholder="(11) 99999-0000" {...register("sender_phone")} />
          </Field>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-3">Endereço de origem</p>
          <AddressFields prefix="origin_address" register={register} errors={errors} />
        </div>
      </div>

      {/* Destinatário */}
      <div className="card">
        <SectionTitle icon={MapPin} title="Destinatário" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Nome completo" error={errors.recipient_name?.message} required>
              <input className="input" placeholder="Maria Souza" {...register("recipient_name")} />
            </Field>
          </div>
          <Field label="WhatsApp (para notificações automáticas)" error={errors.recipient_phone?.message}>
            <input className="input" placeholder="(11) 99999-0001" {...register("recipient_phone")} />
          </Field>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium mb-3">Endereço de destino</p>
          <AddressFields prefix="destination_address" register={register} errors={errors} />
        </div>
      </div>

      {/* Dados da encomenda */}
      <div className="card">
        <SectionTitle icon={Package} title="Dados da Encomenda" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Descrição do conteúdo" error={errors.description?.message}>
              <input className="input" placeholder="Eletrônicos, roupas, documentos..." {...register("description")} />
            </Field>
          </div>
          <Field label="Peso (kg)" error={errors.weight_kg?.message}>
            <input className="input" type="number" step="0.1" placeholder="1.5" {...register("weight_kg")} />
          </Field>
          <Field label="Previsão de entrega" error={errors.estimated_delivery_date?.message}>
            <input className="input" type="date" {...register("estimated_delivery_date")} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Observações" error={errors.notes?.message}>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Frágil, não empilhar, etc."
                {...register("notes")}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="card">
        <SectionTitle icon={DollarSign} title="Valores" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Valor do frete (R$)" error={errors.freight_value?.message} required>
            <input className="input" type="number" step="0.01" placeholder="25.00" {...register("freight_value")} />
          </Field>
          <Field label="Valor declarado (R$)" error={errors.declared_value?.message}>
            <input className="input" type="number" step="0.01" placeholder="150.00" {...register("declared_value")} />
          </Field>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          O seguro é calculado automaticamente como 2% do valor declarado.
        </p>
      </div>

      {/* Erro global */}
      {errors.root && (
        <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
          <p className="text-danger-600 text-sm">{errors.root.message}</p>
        </div>
      )}

      {/* Botões */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <a href="/dashboard/orders" className="btn-secondary">
          Cancelar
        </a>
        <button type="submit" disabled={isPending} className="btn-primary">
          {isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Criando pedido...
            </>
          ) : (
            "Criar Pedido"
          )}
        </button>
      </div>
    </form>
  );
}
