"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download, BarChart3, TrendingUp, Package,
  CheckCircle2, XCircle, Clock, Loader2,
} from "lucide-react";
import { clsx } from "clsx";

const STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando", collected: "Coletado", in_transit: "Em Trânsito",
  out_for_delivery: "Saiu p/ Entrega", delivered: "Entregue",
  failed: "Falha", returned: "Devolvido", cancelled: "Cancelado",
};

function useSummary(from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "summary", from, to],
    queryFn: () => fetch(`/api/reports/summary?from=${from}&to=${to}`).then((r) => r.json()),
    enabled: !!from && !!to,
  });
}

function today() { return new Date().toISOString().split("T")[0]; }
function firstOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0];
}

export function ReportsView() {
  const [from, setFrom] = useState(firstOfMonth());
  const [to,   setTo]   = useState(today());
  const [exportStatus, setExportStatus] = useState("");

  const { data, isLoading } = useSummary(from, to);

  function buildExportUrl() {
    const p = new URLSearchParams({ from, to });
    if (exportStatus) p.set("status", exportStatus);
    return `/api/reports/export?${p}`;
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500 text-sm mt-0.5">Análise de desempenho operacional por período.</p>
      </div>

      {/* Filtros */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-brand-500" /> Filtros do Relatório
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Data inicial</label>
            <input type="date" className="input" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Data final</label>
            <input type="date" className="input" value={to} min={from} max={today()} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <label className="label">Atalhos</label>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "Este mês", from: firstOfMonth(), to: today() },
                { label: "7 dias",   from: new Date(Date.now() - 7*86400000).toISOString().split("T")[0], to: today() },
                { label: "30 dias",  from: new Date(Date.now() - 30*86400000).toISOString().split("T")[0], to: today() },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => { setFrom(preset.from); setTo(preset.to); }}
                  className={clsx(
                    "px-2.5 py-1.5 rounded-lg text-xs font-medium border transition",
                    from === preset.from && to === preset.to
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-brand-300"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-brand-500" />
        </div>
      ) : data && (
        <>
          {/* Cards de totais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total de pedidos",   value: data.totals.total,     icon: Package,      color: "text-brand-600",   bg: "bg-brand-50" },
              { label: "Entregues",          value: data.totals.delivered, icon: CheckCircle2, color: "text-green-600",   bg: "bg-green-50" },
              { label: "Falhas",             value: data.totals.failed,    icon: XCircle,      color: "text-red-500",     bg: "bg-red-50" },
              { label: "Em andamento",       value: data.totals.in_progress, icon: Clock,      color: "text-amber-600",   bg: "bg-amber-50" },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <div className={clsx("p-1.5 rounded-lg", card.bg)}>
                      <Icon size={14} className={card.color} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              );
            })}
          </div>

          {/* Financeiro + Taxas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="card">
              <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-brand-500" /> Financeiro
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Receita total</span>
                  <span className="font-bold text-gray-900">{fmt(data.financial.total_revenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total em fretes</span>
                  <span className="font-semibold text-gray-800">{fmt(data.financial.total_freight)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Ticket médio</span>
                  <span className="font-semibold text-brand-700">{fmt(data.financial.avg_ticket)}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 text-sm mb-4">Indicadores de Qualidade</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Taxa de entrega</span>
                    <span className="font-bold text-green-700">{data.rates.delivery_rate}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: data.rates.delivery_rate }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Cumprimento de SLA</span>
                    <span className="font-bold text-brand-700">{data.rates.sla_rate}</span>
                  </div>
                  {data.rates.sla_rate !== "N/A" && (
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: data.rates.sla_rate }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Distribuição por status */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Distribuição por Status</h3>
            <div className="space-y-2">
              {Object.entries(data.by_status)
                .sort(([, a], [, b]) => (b as number) - (a as number))
                .map(([status, count]) => {
                  const pct = data.totals.total > 0 ? ((count as number) / data.totals.total) * 100 : 0;
                  return (
                    <div key={status} className="flex items-center gap-3 text-sm">
                      <span className="w-32 text-gray-600 flex-shrink-0">{STATUS_LABELS[status] ?? status}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full bg-brand-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right font-medium text-gray-700 flex-shrink-0">{count as number}</span>
                      <span className="w-10 text-right text-gray-400 flex-shrink-0 text-xs">{pct.toFixed(0)}%</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      {/* Exportação CSV */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
          <Download size={15} className="text-brand-500" /> Exportar para Excel / CSV
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Baixe os pedidos do período selecionado. O arquivo abre diretamente no Excel com todos os dados.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={exportStatus}
            onChange={(e) => setExportStatus(e.target.value)}
            className="input max-w-[200px]"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <a
            href={buildExportUrl()}
            download
            className="btn-primary"
          >
            <Download size={15} />
            Baixar CSV
          </a>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Máximo de 5.000 registros por exportação. Use filtros de data para exportações maiores.
        </p>
      </div>
    </div>
  );
}
