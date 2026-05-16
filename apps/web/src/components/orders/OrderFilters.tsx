"use client";

import { clsx } from "clsx";
import type { Order } from "@nexcargo/shared";
import { ORDER_STATUS_CONFIG } from "./OrderStatusBadge";

const ALL_STATUSES: Array<{ value: Order["status"] | "all"; label: string }> = [
  { value: "all",              label: "Todos" },
  { value: "pending",          label: "Aguardando" },
  { value: "collected",        label: "Coletado" },
  { value: "in_transit",       label: "Em Trânsito" },
  { value: "out_for_delivery", label: "Saiu p/ Entrega" },
  { value: "delivered",        label: "Entregue" },
  { value: "failed",           label: "Falha" },
  { value: "returned",         label: "Devolvido" },
  { value: "cancelled",        label: "Cancelado" },
];

interface Props {
  selected: string;
  onChange: (status: string) => void;
}

export function OrderFilters({ selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {ALL_STATUSES.map((s) => (
        <button
          key={s.value}
          onClick={() => onChange(s.value === "all" ? "" : s.value)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
            (s.value === "all" && !selected) || selected === s.value
              ? "bg-brand-600 text-white border-brand-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600"
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
