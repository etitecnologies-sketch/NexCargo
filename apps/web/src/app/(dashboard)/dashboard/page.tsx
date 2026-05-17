import { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { DeliveryChart } from "@/components/dashboard/DeliveryChart";
import { SlaPanel } from "@/components/dashboard/SlaPanel";

export const metadata: Metadata = { title: "Dashboard — NexCargo" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="space-y-6 bg-mesh min-h-full">
      {/* Cabeçalho da página */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[13px] font-medium text-slate-400 capitalize">{dateStr}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">
            {getGreeting()}, Admin 👋
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[12px] text-slate-400 bg-white border border-slate-100 rounded-xl px-3 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Sistema operacional
        </div>
      </div>

      {/* Cards de métricas */}
      <StatsCards />

      {/* Gráfico + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryChart />
        </div>
        <div>
          <SlaPanel />
        </div>
      </div>

      {/* Pedidos recentes */}
      <RecentOrders />
    </div>
  );
}
