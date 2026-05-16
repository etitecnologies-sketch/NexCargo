"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { clsx } from "clsx";
import {
  Clock, Package, Truck, Home, CheckCircle2,
  XCircle, RotateCcw, Ban,
} from "lucide-react";
import type { Order, OrderEvent } from "@nexcargo/shared";

const STATUS_ICON: Record<Order["status"], React.ElementType> = {
  pending:           Clock,
  collected:         Package,
  in_transit:        Truck,
  out_for_delivery:  Home,
  delivered:         CheckCircle2,
  failed:            XCircle,
  returned:          RotateCcw,
  cancelled:         Ban,
};

const STATUS_COLOR: Record<Order["status"], string> = {
  pending:           "bg-gray-100 text-gray-500",
  collected:         "bg-blue-100 text-blue-600",
  in_transit:        "bg-amber-100 text-amber-600",
  out_for_delivery:  "bg-orange-100 text-orange-600",
  delivered:         "bg-green-100 text-green-600",
  failed:            "bg-red-100 text-red-500",
  returned:          "bg-purple-100 text-purple-600",
  cancelled:         "bg-gray-100 text-gray-400",
};

interface Props {
  events: OrderEvent[];
}

export function OrderTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Nenhum evento registrado ainda.
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const Icon = STATUS_ICON[event.status as Order["status"]] ?? Clock;
        const colorClass = STATUS_COLOR[event.status as Order["status"]] ?? "bg-gray-100 text-gray-500";
        const isLast = index === events.length - 1;

        return (
          <li key={event.id} className="flex gap-4">
            {/* Linha vertical + ícone */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center z-10", colorClass)}>
                <Icon size={16} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-gray-200 my-1 min-h-[20px]" />
              )}
            </div>

            {/* Conteúdo */}
            <div className={clsx("pb-5 flex-1 min-w-0", isLast && "pb-0")}>
              <p className="font-medium text-gray-800 text-sm leading-tight">
                {event.description}
              </p>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {event.location && (
                  <span className="text-xs text-gray-500">{event.location}</span>
                )}
                <time className="text-xs text-gray-400">
                  {format(new Date(event.occurred_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
