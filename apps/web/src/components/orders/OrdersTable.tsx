"use client";

import Link from "next/link";
import { Package, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { OrderStatusBadge } from "./OrderStatusBadge";
import type { Order } from "@nexcargo/shared";

interface Props {
  orders: Order[];
  isLoading: boolean;
  isError: boolean;
}

export function OrdersTable({ orders, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-brand-500" />
        <span className="ml-2 text-gray-500 text-sm">Carregando pedidos...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <AlertCircle size={32} className="text-danger-400" />
        <p className="text-gray-500 text-sm">Não foi possível carregar os pedidos.</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="p-4 rounded-full bg-gray-50">
          <Package size={32} className="text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">Nenhum pedido encontrado</p>
        <p className="text-gray-400 text-sm">Tente ajustar os filtros ou criar um novo pedido.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Rastreio</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Remetente</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destinatário</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Destino</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Previsão</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-brand-50">
                    <Package size={13} className="text-brand-500" />
                  </div>
                  <span className="font-mono text-xs font-semibold text-gray-700">
                    {order.tracking_code}
                  </span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <p className="text-gray-800 font-medium">{order.sender_name}</p>
                {order.sender_phone && (
                  <p className="text-gray-400 text-xs">{order.sender_phone}</p>
                )}
              </td>
              <td className="py-3.5 px-4">
                <p className="text-gray-800 font-medium">{order.recipient_name}</p>
                {order.recipient_phone && (
                  <p className="text-gray-400 text-xs">{order.recipient_phone}</p>
                )}
              </td>
              <td className="py-3.5 px-4 text-gray-500">
                {order.destination_address.city} - {order.destination_address.state}
              </td>
              <td className="py-3.5 px-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-3.5 px-4 text-gray-500">
                {order.estimated_delivery_date
                  ? format(new Date(order.estimated_delivery_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : <span className="text-gray-300">—</span>
                }
              </td>
              <td className="py-3.5 px-4 text-gray-700 font-medium">
                {order.total_value > 0
                  ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_value)
                  : <span className="text-gray-300">—</span>
                }
              </td>
              <td className="py-3.5 px-4">
                <Link
                  href={`/dashboard/orders/${order.id}`}
                  className="flex items-center gap-1 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-brand-700"
                >
                  <span className="text-xs">Ver</span>
                  <ChevronRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
