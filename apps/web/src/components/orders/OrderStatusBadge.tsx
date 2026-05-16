import { clsx } from "clsx";
import type { Order } from "@nexcargo/shared";

interface StatusConfig {
  label: string;
  className: string;
  dot: string;
}

export const ORDER_STATUS_CONFIG: Record<Order["status"], StatusConfig> = {
  pending:           { label: "Aguardando",      className: "bg-gray-100 text-gray-600",    dot: "bg-gray-400" },
  collected:         { label: "Coletado",         className: "bg-blue-50 text-blue-600",     dot: "bg-blue-500" },
  in_transit:        { label: "Em Trânsito",      className: "bg-amber-50 text-amber-600",   dot: "bg-amber-500" },
  out_for_delivery:  { label: "Saiu p/ Entrega",  className: "bg-orange-50 text-orange-600", dot: "bg-orange-500" },
  delivered:         { label: "Entregue",         className: "bg-green-50 text-green-700",   dot: "bg-green-500" },
  failed:            { label: "Falha",            className: "bg-red-50 text-red-600",       dot: "bg-red-500" },
  returned:          { label: "Devolvido",        className: "bg-purple-50 text-purple-600", dot: "bg-purple-500" },
  cancelled:         { label: "Cancelado",        className: "bg-gray-100 text-gray-500",    dot: "bg-gray-400" },
};

interface Props {
  status: Order["status"];
  size?: "sm" | "md";
}

export function OrderStatusBadge({ status, size = "md" }: Props) {
  const config = ORDER_STATUS_CONFIG[status];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        config.className
      )}
    >
      <span className={clsx("rounded-full flex-shrink-0", size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2", config.dot)} />
      {config.label}
    </span>
  );
}
