"use client";

import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

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
    refetchInterval: 60_000,
  });
}

const cardConfig = [
  {
    key: "orders_today",
    label: "Pedidos Hoje",
    icon: Package,
    gradient: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    glowColor: "shadow-glow-blue",
  },
  {
    key: "in_transit",
    label: "Em Trânsito",
    icon: Truck,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    glowColor: "shadow-glow-amber",
  },
  {
    key: "delivered_month",
    label: "Entregues (mês)",
    icon: CheckCircle,
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    glowColor: "shadow-glow-green",
  },
  {
    key: "sla",
    label: "SLA em Risco",
    icon: AlertTriangle,
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-50",
    iconColor: "text-red-500",
    glowColor: "shadow-glow-red",
  },
] as const;

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="skeleton h-4 w-28 rounded" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
      <div className="skeleton h-9 w-20 rounded mb-3" />
      <div className="skeleton h-3 w-24 rounded" />
    </div>
  );
}

export function StatsCards() {
  const { data, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const cards = [
    {
      ...cardConfig[0],
      value: data?.orders_today.value ?? 0,
      change: data?.orders_today.change ?? "—",
      isPositive: !data?.orders_today.change.startsWith("-"),
      subLabel: "vs. ontem",
    },
    {
      ...cardConfig[1],
      value: data?.in_transit.value ?? 0,
      change: data?.in_transit.change ?? "—",
      isPositive: !data?.in_transit.change.startsWith("-"),
      subLabel: "vs. ontem",
    },
    {
      ...cardConfig[2],
      value: data?.delivered_month.value ?? 0,
      change: data?.delivered_month.change ?? "—",
      isPositive: !data?.delivered_month.change.startsWith("-"),
      subLabel: "vs. mês anterior",
    },
    {
      ...cardConfig[3],
      value: (data?.sla.at_risk ?? 0) + (data?.sla.late ?? 0),
      change: data ? `${data.sla.late} atrasado${data.sla.late !== 1 ? "s" : ""}` : "—",
      isPositive: false,
      subLabel: "do total ativo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const TrendIcon = card.isPositive ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="relative rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden cursor-default"
          >
            {/* Barra colorida no topo */}
            <div className={`h-1 w-full bg-gradient-to-r ${card.gradient}`} />

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[13px] font-medium text-slate-500">{card.label}</p>
                <div className={`p-2.5 rounded-xl ${card.bg}`}>
                  <Icon size={18} className={card.iconColor} />
                </div>
              </div>

              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {card.value.toLocaleString("pt-BR")}
              </p>

              <div className="mt-3 flex items-center gap-1.5">
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
                  card.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  <TrendIcon size={11} />
                  {card.change}
                </div>
                <span className="text-[11px] text-slate-400">{card.subLabel}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
