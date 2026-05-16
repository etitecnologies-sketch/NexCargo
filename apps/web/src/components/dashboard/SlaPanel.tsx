"use client";

import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Loader2 } from "lucide-react";

function useSlaData() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
    refetchInterval: 60_000,
  });
}

export function SlaPanel() {
  const { data, isLoading } = useSlaData();

  const sla = data?.sla;
  const total = sla?.total_active ?? 0;

  const items = [
    {
      label: "No prazo",
      count: sla?.ok ?? 0,
      pct: total > 0 ? Math.round(((sla?.ok ?? 0) / total) * 100) : 0,
      bar: "bg-success-500",
      dot: "bg-success-500",
    },
    {
      label: "Em risco",
      count: sla?.at_risk ?? 0,
      pct: total > 0 ? Math.round(((sla?.at_risk ?? 0) / total) * 100) : 0,
      bar: "bg-warning-500",
      dot: "bg-warning-500",
    },
    {
      label: "Atrasados",
      count: sla?.late ?? 0,
      pct: total > 0 ? Math.round(((sla?.late ?? 0) / total) * 100) : 0,
      bar: "bg-danger-500",
      dot: "bg-danger-500",
    },
  ];

  return (
    <div className="card h-full">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">SLA de Entregas</h2>
        <p className="text-sm text-gray-400 mt-0.5">Pedidos ativos em relação ao prazo</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 size={20} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          {/* Barra visual */}
          <div className="flex rounded-full overflow-hidden h-3 mb-5">
            {total === 0 ? (
              <div className="flex-1 bg-gray-100 rounded-full" />
            ) : (
              items.map((item) => (
                item.pct > 0 && (
                  <div
                    key={item.label}
                    className={item.bar}
                    style={{ width: `${item.pct}%` }}
                  />
                )
              ))
            )}
          </div>

          {/* Legenda */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={clsx("w-2.5 h-2.5 rounded-full", item.dot)} />
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <span className="text-xs text-gray-400">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
            <span className="text-sm text-gray-500">Total ativo</span>
            <span className="text-sm font-bold text-gray-900">{total}</span>
          </div>
        </>
      )}
    </div>
  );
}
