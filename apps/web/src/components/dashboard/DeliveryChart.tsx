"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";

function useChartData() {
  return useQuery({
    queryKey: ["dashboard", "chart"],
    queryFn: () =>
      fetch("/api/dashboard/chart").then((r) => r.json()).then((j) => j.data),
    refetchInterval: 120_000,
  });
}

export function DeliveryChart() {
  const { data, isLoading } = useChartData();

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Entregas — Últimos 7 dias</h2>
        <p className="text-sm text-gray-400 mt-0.5">Entregas realizadas vs. saídas para entrega</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Loader2 size={20} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="colorEntregues" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="colorTentativas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="tentativas"
              name="Saídas"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorTentativas)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="entregues"
              name="Entregues"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#colorEntregues)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
