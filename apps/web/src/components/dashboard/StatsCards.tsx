"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Stats {
  orders_today:    { value: number; change: string };
  in_transit:      { value: number; change: string };
  delivered_month: { value: number; change: string };
  sla: { at_risk: number; late: number; ok: number; total_active: number };
}

function useStats() {
  return useQuery<Stats>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
    refetchInterval: 60_000, // atualiza a cada 1 minuto
  });
}

export function StatsCards() {
  const { data, isLoading } = useStats();

  const cards = [
    {
      label: "Pedidos Hoje",
      value: data?.orders_today.value ?? 0,
      change: data?.orders_today.change ?? "—",
      positive: !data?.orders_today.change.startsWith("-"),
      icon: Package,
      iconBg: "bg-brand-50",
      iconColor: "text-brand-600",
    },
    {
      label: "Em Trânsito",
      value: data?.in_transit.value ?? 0,
      change: data?.in_transit.change ?? "—",
      positive: !data?.in_transit.change.startsWith("-"),
      icon: Truck,
      iconBg: "bg-warning-50",
      iconColor: "text-warning-600",
    },
    {
      label: "Entregues (mês)",
      value: data?.delivered_month.value ?? 0,
      change: data?.delivered_month.change ?? "—",
      positive: !data?.delivered_month.change.startsWith("-"),
      icon: CheckCircle,
      iconBg: "bg-success-50",
      iconColor: "text-success-600",
    },
    {
      label: "SLA em Risco",
      value: (data?.sla.at_risk ?? 0) + (data?.sla.late ?? 0),
      change: data ? `${data.sla.late} atrasado${data.sla.late !== 1 ? "s" : ""}` : "—",
      positive: false,
      icon: AlertTriangle,
      iconBg: "bg-danger-50",
      iconColor: "text-danger-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin text-gray-300 mt-2" />
                ) : (
                  <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
                )}
              </div>
              <div className={clsx("p-3 rounded-xl", card.iconBg)}>
                <Icon size={20} className={card.iconColor} />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className={clsx("text-xs font-medium", card.positive ? "text-success-600" : "text-danger-500")}>
                {card.change}
              </span>
              <span className="text-xs text-gray-400 ml-1">
                {card.label === "SLA em Risco" ? "do total ativo" : "vs. ontem"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
