"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Edit2, Loader2, AlertCircle,
  MapPin, User, Package, DollarSign, MessageSquare, Printer,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrder } from "@/hooks/useOrders";
import { OrderStatusBadge, ORDER_STATUS_CONFIG } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";
import { UpdateStatusModal } from "./UpdateStatusModal";
import type { Order } from "@nexcargo/shared";

interface Props { orderId: string }

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-2.5 gap-0.5 sm:gap-4 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-400 uppercase tracking-wide sm:w-36 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-800">{value ?? <span className="text-gray-300">—</span>}</dd>
    </div>
  );
}

function formatAddress(addr: Order["origin_address"]) {
  const parts = [addr.street, addr.number, addr.complement, addr.neighborhood].filter(Boolean).join(", ");
  return `${parts} — ${addr.city}/${addr.state} ${addr.zip}`;
}

export function OrderDetailView({ orderId }: Props) {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle size={32} className="text-danger-400" />
        <p className="text-gray-500">Pedido não encontrado.</p>
        <Link href="/dashboard/orders" className="btn-secondary">Voltar</Link>
      </div>
    );
  }

  const order = data.data as Order;
  const canUpdate = !["delivered", "returned", "cancelled"].includes(order.status);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/orders"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900 font-mono">
                  {order.tracking_code}
                </h1>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="text-gray-400 text-sm mt-0.5">
                Criado em {format(new Date(order.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/orders/${order.id}/label`}
              target="_blank"
              className="btn-secondary"
            >
              <Printer size={15} />
              Etiqueta
            </Link>
            {canUpdate && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Edit2 size={15} />
                Atualizar Status
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna esquerda — dados do pedido */}
          <div className="lg:col-span-2 space-y-5">
            {/* Remetente */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <User size={16} className="text-brand-500" />
                <h2 className="font-semibold text-gray-800 text-sm">Remetente</h2>
              </div>
              <dl>
                <InfoRow label="Nome" value={order.sender_name} />
                <InfoRow label="WhatsApp" value={order.sender_phone} />
                <InfoRow label="Origem" value={formatAddress(order.origin_address)} />
              </dl>
            </div>

            {/* Destinatário */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-brand-500" />
                <h2 className="font-semibold text-gray-800 text-sm">Destinatário</h2>
              </div>
              <dl>
                <InfoRow label="Nome" value={order.recipient_name} />
                <InfoRow label="WhatsApp" value={order.recipient_phone} />
                <InfoRow label="Destino" value={formatAddress(order.destination_address)} />
              </dl>

              {order.recipient_phone && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                  <a
                    href={`https://wa.me/${order.recipient_phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs gap-1.5"
                  >
                    <MessageSquare size={13} />
                    Abrir WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Encomenda */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <Package size={16} className="text-brand-500" />
                <h2 className="font-semibold text-gray-800 text-sm">Encomenda</h2>
              </div>
              <dl>
                <InfoRow label="Descrição" value={order.description} />
                <InfoRow label="Peso" value={order.weight_kg ? `${order.weight_kg} kg` : null} />
                <InfoRow label="Previsão" value={
                  order.estimated_delivery_date
                    ? format(new Date(order.estimated_delivery_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })
                    : null
                } />
                {order.delivered_at && (
                  <InfoRow label="Entregue em" value={
                    format(new Date(order.delivered_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                  } />
                )}
                {order.notes && <InfoRow label="Obs." value={order.notes} />}
              </dl>
            </div>

            {/* Financeiro */}
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign size={16} className="text-brand-500" />
                <h2 className="font-semibold text-gray-800 text-sm">Financeiro</h2>
              </div>
              <dl>
                <InfoRow label="Frete" value={
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.freight_value)
                } />
                <InfoRow label="Seguro" value={
                  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.insurance_value)
                } />
                <InfoRow label="Valor declarado" value={
                  order.declared_value
                    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.declared_value)
                    : null
                } />
              </dl>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-700">Total</span>
                <span className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_value)}
                </span>
              </div>
            </div>
          </div>

          {/* Coluna direita — linha do tempo */}
          <div className="space-y-5">
            <div className="card">
              <h2 className="font-semibold text-gray-800 text-sm mb-4">Histórico de Rastreio</h2>
              <OrderTimeline events={order.events ?? []} />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <UpdateStatusModal
          orderId={order.id}
          currentStatus={order.status}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
