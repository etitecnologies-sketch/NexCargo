"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

function useSlaData() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
    refetchInterval: 60_000,
  });
}

const slaConfig = [
  {
    key: "ok",
    label: "No prazo",
    color: "#10b981",
    bg: "bg-emerald-500",
    ring: "ring-emerald-500",
    lightBg: "bg-emerald-50",
    textColor: "text-emerald-700",
    Icon: CheckCircle2,
  },
  {
    key: "at_risk",
    label: "Em risco",
    color: "#f59e0b",
    bg: "bg-amber-400",
    ring: "ring-amber-400",
    lightBg: "bg-amber-50",
    textColor: "text-amber-700",
    Icon: Clock,
  },
  {
    key: "late",
    label: "Atrasados",
    color: "#ef4444",
    bg: "bg-red-500",
    ring: "ring-red-500",
    lightBg: "bg-red-50",
    textColor: "text-red-600",
    Icon: XCircle,
  },
] as const;

function SkeletonSla() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 h-full">
      <div className="skeleton h-4 w-32 rounded mb-1" />
      <div className="skeleton h-3 w-44 rounded mb-6" />
      <div className="skeleton h-3 w-full rounded-full mb-6" />
      <div className="space-y-4">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center justify-between">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-12 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SlaPanel() {
  const { data, isLoading } = useSlaData();

  if (isLoading) return <SkeletonSla />;

  const sla = data?.sla;
  const total = sla?.total_active ?? 0;

  const items = slaConfig.map((cfg) => ({
    ...cfg,
    count: sla?.[cfg.key] ?? 0,
    pct: total > 0 ? Math.round(((sla?.[cfg.key] ?? 0) / total) * 100) : 0,
  }));

  const okPct = items[0].pct;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 h-full flex flex-col"
    >
      <div className="mb-5">
        <h2 className="text-[15px] font-bold text-slate-900">SLA de Entregas</h2>
        <p className="text-[12px] text-slate-400 mt-0.5">Pedidos ativos em relação ao prazo</p>
      </div>

      {/* Número central de SLA */}
      <div className="flex items-center justify-center mb-5">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
            {total > 0 && (
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - okPct / 100) }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{okPct}%</span>
            <span className="text-[10px] text-slate-400 font-medium">no prazo</span>
          </div>
        </div>
      </div>

      {/* Barra segmentada */}
      <div className="flex rounded-full overflow-hidden h-2 mb-5 gap-0.5">
        {total === 0 ? (
          <div className="flex-1 bg-slate-100 rounded-full" />
        ) : (
          items.map((item) =>
            item.pct > 0 ? (
              <motion.div
                key={item.label}
                className={item.bg}
                initial={{ width: 0 }}
                animate={{ width: `${item.pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              />
            ) : null
          )
        )}
      </div>

      {/* Legenda */}
      <div className="space-y-2.5 flex-1">
        {items.map((item) => {
          const Icon = item.Icon;
          return (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={14} className={item.textColor} />
                <span className="text-[13px] text-slate-600">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-slate-900">{item.count}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${item.lightBg} ${item.textColor}`}>
                  {item.pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <span className="text-[12px] text-slate-400">Total ativo</span>
        <span className="text-[15px] font-bold text-slate-900">{total}</span>
      </div>
    </motion.div>
  );
}
