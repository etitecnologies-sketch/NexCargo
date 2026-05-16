"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Loader2 } from "lucide-react";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order } from "@nexcargo/shared";

const NEXT_STATUSES: Record<Order["status"], Array<Order["status"]>> = {
  pending:           ["collected", "cancelled"],
  collected:         ["in_transit", "cancelled"],
  in_transit:        ["out_for_delivery", "failed", "returned"],
  out_for_delivery:  ["delivered", "failed"],
  delivered:         [],
  failed:            ["out_for_delivery", "returned", "cancelled"],
  returned:          [],
  cancelled:         [],
};

const STATUS_LABELS: Record<Order["status"], string> = {
  pending:           "Aguardando",
  collected:         "Coletado",
  in_transit:        "Em Trânsito",
  out_for_delivery:  "Saiu para Entrega",
  delivered:         "Entregue",
  failed:            "Falha na Entrega",
  returned:          "Devolvido",
  cancelled:         "Cancelado",
};

const schema = z.object({
  status: z.enum([
    "pending", "collected", "in_transit", "out_for_delivery",
    "delivered", "failed", "returned", "cancelled",
  ]),
  description: z.string().min(3, "Descrição obrigatória"),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  orderId: string;
  currentStatus: Order["status"];
  onClose: () => void;
}

export function UpdateStatusModal({ orderId, currentStatus, onClose }: Props) {
  const { mutateAsync, isPending } = useUpdateOrderStatus(orderId);
  const nextOptions = NEXT_STATUSES[currentStatus];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: nextOptions[0] },
  });

  async function onSubmit(data: FormData) {
    try {
      await mutateAsync(data);
      onClose();
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Erro ao atualizar status.",
      });
    }
  }

  if (nextOptions.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fundo escuro */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Atualizar Status</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Novo status <span className="text-danger-500">*</span></label>
            <select className="input" {...register("status")}>
              {nextOptions.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Descrição do evento <span className="text-danger-500">*</span></label>
            <input
              className="input"
              placeholder="Ex: Objeto coletado na unidade de São Paulo"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-danger-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="label">Localização (opcional)</label>
            <input
              className="input"
              placeholder="Ex: São Paulo - SP"
              {...register("location")}
            />
          </div>

          {errors.root && (
            <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
              <p className="text-danger-600 text-sm">{errors.root.message}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
              {isPending ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : "Confirmar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
