"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, Phone, Mail, MapPin, FileText,
  Package, Loader2, AlertCircle, Edit2, Check, X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCustomer, useUpdateCustomer } from "@/hooks/useCustomers";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import type { Order } from "@nexcargo/shared";

interface Props { customerId: string }

export function CustomerDetailView({ customerId }: Props) {
  const { data, isLoading, isError } = useCustomer(customerId);
  const { mutateAsync: update, isPending: isSaving } = useUpdateCustomer(customerId);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes]               = useState("");

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-500" size={24} /></div>;
  if (isError || !data) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <AlertCircle size={32} className="text-danger-400" />
      <p className="text-gray-500">Cliente não encontrado.</p>
      <Link href="/dashboard/customers" className="btn-secondary">Voltar</Link>
    </div>
  );

  const customer = data.data;
  const initials  = customer.name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
  const totalSpent = customer.orders.reduce((sum, o) => sum + (o.total_value ?? 0), 0);

  async function saveNotes() {
    await update({ notes });
    setEditingNotes(false);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/customers" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
          <ChevronLeft size={20} />
        </Link>
        <h1 className="text-xl font-bold text-gray-900">Detalhe do Cliente</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Coluna esquerda */}
        <div className="space-y-5">
          {/* Card de identidade */}
          <div className="card text-center">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl mx-auto mb-3">
              {initials}
            </div>
            <h2 className="font-bold text-gray-900 text-lg">{customer.name}</h2>
            {customer.document && <p className="text-gray-400 text-sm mt-0.5">{customer.document}</p>}

            <div className="mt-4 space-y-2 text-sm text-left">
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="hover:text-brand-600 hover:underline">{customer.phone}</a>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <a href={`mailto:${customer.email}`} className="hover:text-brand-600 hover:underline truncate">{customer.email}</a>
                </div>
              )}
              {customer.address?.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span>{customer.address.city} - {customer.address.state}</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo de pedidos */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Resumo</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total de pedidos</span>
                <span className="font-semibold text-gray-900">{customer.orders.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total gasto</span>
                <span className="font-semibold text-gray-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalSpent)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente desde</span>
                <span className="font-semibold text-gray-900">
                  {format(new Date(customer.created_at), "MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                <FileText size={14} /> Observações
              </h3>
              {!editingNotes ? (
                <button onClick={() => { setNotes(customer.notes ?? ""); setEditingNotes(true); }}
                  className="p-1 text-gray-400 hover:text-brand-600 rounded transition">
                  <Edit2 size={13} />
                </button>
              ) : (
                <div className="flex gap-1">
                  <button onClick={saveNotes} disabled={isSaving} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditingNotes(false)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
            {editingNotes ? (
              <textarea
                className="input text-sm resize-none w-full"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Escreva observações sobre este cliente..."
              />
            ) : (
              <p className="text-sm text-gray-500">
                {customer.notes || <span className="text-gray-300 italic">Sem observações.</span>}
              </p>
            )}
          </div>
        </div>

        {/* Coluna direita — histórico de pedidos */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package size={16} className="text-brand-500" />
              Histórico de Pedidos ({customer.orders.length})
            </h3>

            {customer.orders.length === 0 ? (
              <div className="text-center py-8">
                <Package size={28} className="text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Nenhum pedido vinculado a este cliente.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {customer.orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50/30 transition group"
                  >
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-white transition">
                      <Package size={14} className="text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-gray-700">{order.tracking_code}</span>
                        <OrderStatusBadge status={order.status as Order["status"]} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        {(order.destination_address as any)?.city && ` · ${(order.destination_address as any).city}`}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total_value)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
