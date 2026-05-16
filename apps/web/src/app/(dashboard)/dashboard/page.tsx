import { Metadata } from "next";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { DeliveryChart } from "@/components/dashboard/DeliveryChart";
import { SlaPanel } from "@/components/dashboard/SlaPanel";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral das operações de hoje
        </p>
      </div>

      {/* Cards de métricas */}
      <StatsCards />

      {/* Gráfico + painel SLA lado a lado */}
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
