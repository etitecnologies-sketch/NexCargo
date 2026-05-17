"use client";

import Link from "next/link";
import { ArrowUpRight, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export function RecentOrders() {
  const { data, isLoading } = useOrders({ page: 1, per_page: 5 });
  const orders = data?.data ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Pedidos Recentes</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Últimas movimentações do sistema</p>
        </div>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-1 text-[12px] font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          Ver todos
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="skeleton h-8 w-8 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="skeleton h-3 w-36 rounded" />
                <div className="skeleton h-2.5 w-24 rounded" />
              </div>
              <div className="skeleton h-5 w-20 rounded-full" />
              <div className="skeleton h-3 w-12 rounded" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Package size={22} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500">Nenhum pedido ainda</p>
          <Link href="/dashboard/orders/new" className="mt-3 btn-primary text-xs py-1.5 px-3">
            Criar primeiro pedido
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.05, duration: 0.25 }}
              className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors group"
            >
              {/* Ícone */}
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-blue-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                    {order.tracking_code}
                  </span>
                  <span className="text-[12px] text-slate-500 truncate">{order.recipient_name}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {order.destination_address.city} — {order.destination_address.state}
                </p>
              </div>

              {/* Status */}
              <OrderStatusBadge status={order.status} size="sm" />

              {/* Data */}
              <span className="text-[11px] text-slate-400 flex-shrink-0 hidden md:block">
                {format(new Date(order.created_at), "dd/MM HH:mm", { locale: ptBR })}
              </span>

              {/* Link */}
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
              >
                <ArrowUpRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
