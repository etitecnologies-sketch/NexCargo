"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { MapPin, Clock, Package, Truck, Home, CheckCircle2, XCircle, RotateCcw, Ban } from "lucide-react";
import type { Order, OrderEvent } from "@nexcargo/shared";

const STATUS_CONFIG: Record<Order["status"], { Icon: React.ElementType; color: string; bg: string; ring: string; line: string }> = {
  pending:           { Icon: Clock,        color: "text-slate-500",   bg: "bg-slate-100",   ring: "ring-slate-200",   line: "bg-slate-200"   },
  collected:         { Icon: Package,      color: "text-blue-600",    bg: "bg-blue-100",    ring: "ring-blue-200",    line: "bg-blue-200"    },
  in_transit:        { Icon: Truck,        color: "text-amber-600",   bg: "bg-amber-100",   ring: "ring-amber-200",   line: "bg-amber-200"   },
  out_for_delivery:  { Icon: Home,         color: "text-purple-600",  bg: "bg-purple-100",  ring: "ring-purple-200",  line: "bg-purple-200"  },
  delivered:         { Icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100", ring: "ring-emerald-200", line: "bg-emerald-200" },
  failed:            { Icon: XCircle,      color: "text-red-500",     bg: "bg-red-100",     ring: "ring-red-200",     line: "bg-red-200"     },
  returned:          { Icon: RotateCcw,    color: "text-orange-600",  bg: "bg-orange-100",  ring: "ring-orange-200",  line: "bg-orange-200"  },
  cancelled:         { Icon: Ban,          color: "text-slate-400",   bg: "bg-slate-100",   ring: "ring-slate-200",   line: "bg-slate-200"   },
};

interface Props {
  events: OrderEvent[];
}

export function OrderTimeline({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <Clock size={20} className="text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-500">Nenhum evento registrado</p>
        <p className="text-xs text-slate-400 mt-1">Os eventos de rastreamento aparecem aqui</p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const cfg = STATUS_CONFIG[event.status as Order["status"]] ?? STATUS_CONFIG.pending;
        const { Icon } = cfg;
        const isLast = index === events.length - 1;
        const isFirst = index === 0;

        return (
          <motion.li
            key={event.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.3 }}
            className="flex gap-4"
          >
            {/* Linha + Ícone */}
            <div className="flex flex-col items-center flex-shrink-0 w-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center z-10 ring-2 ${cfg.bg} ${cfg.color} ${cfg.ring} ${isFirst ? "shadow-sm" : ""}`}>
                <Icon size={17} />
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1.5 min-h-[20px] ${cfg.line} opacity-40`} />
              )}
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 min-w-0 ${isLast ? "pb-0" : "pb-5"}`}>
              <div className={`rounded-xl border p-3.5 ${isFirst ? "border-slate-200 bg-slate-50" : "border-transparent bg-transparent"}`}>
                <p className={`font-semibold text-[13px] leading-snug ${isFirst ? "text-slate-900" : "text-slate-700"}`}>
                  {event.description}
                </p>

                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span className="text-[11px] text-slate-500">{event.location}</span>
                    </div>
                  )}
                  <time className="text-[11px] text-slate-400">
                    {format(new Date(event.occurred_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </time>
                </div>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
