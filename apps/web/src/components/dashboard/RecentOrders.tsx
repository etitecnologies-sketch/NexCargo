"use client";

import Link from "next/link";
import { ExternalLink, Package, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export function RecentOrders() {
  const { data, isLoading } = useOrders({ page: 1, per_page: 5 });

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Pedidos Recentes</h2>
        <Link
          href="/dashboard/orders"
          className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
        >
          Ver todos
          <ExternalLink size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Rastreio</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Destinatário</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Destino</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Criado</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(data?.data ?? []).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-400" />
                      <span className="font-mono text-xs font-medium text-gray-700">
                        {order.tracking_code}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-700">{order.recipient_name}</td>
                  <td className="py-3 px-3 text-gray-500">
                    {order.destination_address.city} - {order.destination_address.state}
                  </td>
                  <td className="py-3 px-3">
                    <OrderStatusBadge status={order.status} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-gray-400 text-xs">
                    {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="text-brand-600 hover:text-brand-700"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
              {data?.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                    Nenhum pedido ainda. <Link href="/dashboard/orders/new" className="text-brand-600 hover:underline">Criar primeiro pedido</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
