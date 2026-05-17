"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ArrowUpRight, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@nexcargo/shared";

const COLUMNS: { status: OrderStatus; label: string; color: string; bg: string; dot: string }[] = [
  { status: "pending",          label: "Pendente",          color: "text-slate-600",   bg: "bg-slate-50",   dot: "bg-slate-400"   },
  { status: "collected",        label: "Coletado",          color: "text-blue-600",    bg: "bg-blue-50",    dot: "bg-blue-500"    },
  { status: "in_transit",       label: "Em Trânsito",       color: "text-amber-600",   bg: "bg-amber-50",   dot: "bg-amber-500"   },
  { status: "out_for_delivery", label: "Saiu p/ Entrega",   color: "text-purple-600",  bg: "bg-purple-50",  dot: "bg-purple-500"  },
  { status: "delivered",        label: "Entregue",          color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
];

function OrderCard({ order }: { order: Order }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 cursor-default hover:shadow-md hover:border-slate-200 transition-all"
    >
      {/* Código */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Package size={12} className="text-slate-400" />
          <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            {order.tracking_code}
          </span>
        </div>
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="p-1 text-slate-300 hover:text-brand-500 rounded transition-colors"
        >
          <ArrowUpRight size={12} />
        </Link>
      </div>

      {/* Destinatário */}
      <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">
        {order.recipient_name}
      </p>

      {/* Destino */}
      <div className="flex items-center gap-1 mt-1">
        <MapPin size={10} className="text-slate-400 flex-shrink-0" />
        <p className="text-[11px] text-slate-400 truncate">
          {order.destination_address.city}, {order.destination_address.state}
        </p>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-50">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Calendar size={10} />
          {format(new Date(order.created_at), "dd/MM", { locale: ptBR })}
        </div>
        {order.freight_value > 0 && (
          <span className="text-[10px] font-semibold text-slate-600">
            {order.freight_value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function Column({
  col,
  orders,
}: {
  col: (typeof COLUMNS)[number];
  orders: Order[];
}) {
  return (
    <div className="flex flex-col min-w-[240px] w-64">
      {/* Cabeçalho da coluna */}
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-3 ${col.bg}`}>
        <div className={`w-2 h-2 rounded-full ${col.dot}`} />
        <span className={`text-[12px] font-bold ${col.color}`}>{col.label}</span>
        <span className={`ml-auto text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-white/70 ${col.color}`}>
          {orders.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2.5 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </AnimatePresence>
        {orders.length === 0 && (
          <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-[11px] text-slate-400">Nenhum pedido</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { data, isLoading } = useOrders({ page: 1, per_page: 100 });
  const orders = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col.status} className="min-w-[240px] w-64">
            <div className="skeleton h-9 w-full rounded-xl mb-3" />
            <div className="space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-28 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const grouped = COLUMNS.reduce<Record<string, Order[]>>((acc, col) => {
    acc[col.status] = orders.filter((o) => o.status === col.status);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 overflow-x-auto pb-4"
    >
      {COLUMNS.map((col) => (
        <Column key={col.status} col={col} orders={grouped[col.status] ?? []} />
      ))}
    </motion.div>
  );
}
