"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Package, CheckCircle2, Clock, Truck, Home,
  XCircle, RotateCcw, Ban, MapPin, Loader2, Search,
} from "lucide-react";
import { clsx } from "clsx";
import type { Order, OrderEvent } from "@nexcargo/shared";

// ---- tipos locais ----
type TrackingData = Pick<
  Order,
  | "id" | "tracking_code" | "status" | "recipient_name"
  | "destination_address" | "estimated_delivery_date"
  | "delivered_at" | "created_at"
> & { events: OrderEvent[] };

// ---- configuração de status ----
const STATUS_CONFIG: Record<
  Order["status"],
  { label: string; description: string; icon: React.ElementType; color: string; bg: string }
> = {
  pending:          { label: "Aguardando Coleta",    description: "Seu pedido foi registrado e aguarda coleta.",         icon: Clock,        color: "text-gray-500",   bg: "bg-gray-100" },
  collected:        { label: "Coletado",              description: "Seu pedido foi coletado e está sendo processado.",     icon: Package,      color: "text-blue-600",   bg: "bg-blue-100" },
  in_transit:       { label: "Em Trânsito",           description: "Sua encomenda está a caminho do destino.",            icon: Truck,        color: "text-amber-600",  bg: "bg-amber-100" },
  out_for_delivery: { label: "Saiu para Entrega",     description: "Seu pedido saiu para entrega hoje! Fique em casa.",   icon: Home,         color: "text-orange-600", bg: "bg-orange-100" },
  delivered:        { label: "Entregue",              description: "Seu pedido foi entregue com sucesso!",                icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-100" },
  failed:           { label: "Falha na Entrega",      description: "Não conseguimos entregar. Nova tentativa em breve.",  icon: XCircle,      color: "text-red-500",    bg: "bg-red-100" },
  returned:         { label: "Devolvido",             description: "Seu pedido foi devolvido ao remetente.",              icon: RotateCcw,    color: "text-purple-600", bg: "bg-purple-100" },
  cancelled:        { label: "Cancelado",             description: "Este pedido foi cancelado.",                          icon: Ban,          color: "text-gray-400",   bg: "bg-gray-100" },
};

// Progresso visual de cada status (0–100)
const STATUS_PROGRESS: Record<Order["status"], number> = {
  pending:          10,
  collected:        30,
  in_transit:       55,
  out_for_delivery: 80,
  delivered:        100,
  failed:           80,
  returned:         100,
  cancelled:        100,
};

// ---- componente principal ----
export function PublicTrackingView({ code }: { code: string }) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/track/${code}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((json) => setData(json.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-950 to-brand-800 flex flex-col">
      {/* Cabeçalho */}
      <header className="py-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 text-white">
          <Package size={22} />
          <span className="font-bold text-xl">NexCargo</span>
        </div>
        <p className="text-brand-300 text-sm mt-0.5">Rastreamento de Encomenda</p>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex items-start justify-center px-4 pb-10">
        <div className="w-full max-w-lg mt-2">

          {loading && (
            <div className="text-center py-16 text-white">
              <Loader2 size={32} className="animate-spin mx-auto mb-3 opacity-60" />
              <p className="text-brand-300">Buscando rastreio...</p>
            </div>
          )}

          {notFound && !loading && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-gray-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Código não encontrado</h2>
              <p className="text-gray-500 text-sm mt-1">
                O código <span className="font-mono font-bold">{code}</span> não existe ou ainda não foi registrado.
              </p>
              <p className="text-gray-400 text-xs mt-3">
                Verifique se digitou corretamente ou aguarde alguns minutos.
              </p>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-4">
              {/* Card de status principal */}
              <StatusCard order={data} />

              {/* Linha do tempo */}
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <h3 className="font-semibold text-gray-800 mb-4 text-sm">Histórico de Atualizações</h3>
                <PublicTimeline events={data.events} />
              </div>

              {/* Rodapé */}
              <p className="text-center text-brand-400 text-xs pb-2">
                Última atualização automática ao abrir a página
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- Card de status ----
function StatusCard({ order }: { order: TrackingData }) {
  const config = STATUS_CONFIG[order.status];
  const Icon = config.icon;
  const progress = STATUS_PROGRESS[order.status];
  const isDelivered = order.status === "delivered";
  const isFailed = ["failed", "returned", "cancelled"].includes(order.status);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      {/* Código */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Código de rastreio</p>
        <span className="font-mono text-sm font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg">
          {order.tracking_code}
        </span>
      </div>

      {/* Ícone e status */}
      <div className="flex items-center gap-4 mb-5">
        <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", config.bg)}>
          <Icon size={26} className={config.color} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{config.label}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{config.description}</p>
        </div>
      </div>

      {/* Barra de progresso */}
      {!isFailed && (
        <div className="mb-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Aguardando</span>
            <span>Entregue</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full transition-all duration-700",
                isDelivered ? "bg-green-500" : "bg-brand-500"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Informações */}
      <div className="space-y-2 pt-3 border-t border-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Destinatário</span>
          <span className="font-medium text-gray-800">{order.recipient_name}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-1">
            <MapPin size={12} /> Destino
          </span>
          <span className="font-medium text-gray-800">
            {order.destination_address.city} - {order.destination_address.state}
          </span>
        </div>
        {order.estimated_delivery_date && !isDelivered && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Previsão</span>
            <span className="font-medium text-gray-800">
              {format(new Date(order.estimated_delivery_date + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR })}
            </span>
          </div>
        )}
        {isDelivered && order.delivered_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Entregue em</span>
            <span className="font-medium text-green-700">
              {format(new Date(order.delivered_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Linha do tempo pública ----
function PublicTimeline({ events }: { events: OrderEvent[] }) {
  if (events.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-4">Nenhuma atualização ainda.</p>;
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const config = STATUS_CONFIG[event.status as Order["status"]];
        const Icon = config?.icon ?? Clock;
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center z-10",
                index === 0 ? (config?.bg ?? "bg-gray-100") : "bg-gray-100"
              )}>
                <Icon size={14} className={index === 0 ? (config?.color ?? "text-gray-500") : "text-gray-400"} />
              </div>
              {!isLast && <div className="w-px flex-1 bg-gray-100 my-1 min-h-[16px]" />}
            </div>
            <div className={clsx("flex-1 min-w-0", !isLast && "pb-4")}>
              <p className={clsx(
                "text-sm font-medium leading-snug",
                index === 0 ? "text-gray-800" : "text-gray-500"
              )}>
                {event.description}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {event.location && (
                  <span className="text-xs text-gray-400">{event.location}</span>
                )}
                <time className="text-xs text-gray-400">
                  {format(new Date(event.occurred_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
