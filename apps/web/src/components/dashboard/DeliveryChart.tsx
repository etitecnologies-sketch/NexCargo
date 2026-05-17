"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, TooltipProps,
} from "recharts";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

function useChartData() {
  return useQuery({
    queryKey: ["dashboard", "chart"],
    queryFn: () =>
      fetch("/api/dashboard/chart").then((r) => r.json()).then((j) => j.data),
    refetchInterval: 120_000,
  });
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white rounded-xl px-3 py-2.5 shadow-xl text-xs">
      <p className="font-semibold text-slate-300 mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-bold">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[220px] flex items-end gap-3 px-4 pb-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end gap-1">
          <div className="skeleton rounded-t-lg" style={{ height: `${40 + Math.random() * 120}px` }} />
        </div>
      ))}
    </div>
  );
}

export function DeliveryChart() {
  const { data, isLoading } = useChartData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-start justify-between p-6 pb-4">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Entregas — Últimos 7 dias</h2>
          <p className="text-[12px] text-slate-400 mt-0.5">Realizadas vs. saídas para entrega</p>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-500 font-medium">Entregues</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-500 font-medium">Saídas</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <ChartSkeleton />
      ) : (
        <div className="px-2 pb-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data ?? []} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="gradEntregues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
                </linearGradient>
                <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey="tentativas"
                name="Saídas"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#gradSaidas)"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b" }}
              />
              <Area
                type="monotone"
                dataKey="entregues"
                name="Entregues"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#gradEntregues)"
                dot={false}
                activeDot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
