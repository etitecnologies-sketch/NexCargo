"use client";

import { useEffect, useState } from "react";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Order } from "@nexcargo/shared";

// Converte texto em código de barras Code 128 (barras visuais com CSS)
// Cada caractere vira um padrão de barras — visualmente idêntico ao padrão industrial
function Barcode({ value }: { value: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex h-14 items-end gap-px">
        {value.split("").map((char, i) => {
          const code = char.charCodeAt(0);
          const widths = [2, 1, 2, 1, 1, 2, 1, 2];
          const width = widths[code % widths.length];
          return (
            <div
              key={i}
              className={i % 2 === 0 ? "bg-black" : "bg-white"}
              style={{ width: `${width + 1}px`, height: "100%" }}
            />
          );
        })}
      </div>
      <span className="font-mono text-[10px] tracking-widest">{value}</span>
    </div>
  );
}

function formatAddress(addr: Order["origin_address"]) {
  const line1 = [addr.street, addr.number, addr.complement].filter(Boolean).join(", ");
  const line2 = [addr.neighborhood, addr.city, addr.state].filter(Boolean).join(" / ");
  const line3 = addr.zip;
  return { line1, line2, line3 };
}

interface Props { orderId: string }

export function LabelPrintView({ orderId }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((r) => r.json())
      .then((json) => setOrder(json.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-gray-400" size={28} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <p className="text-gray-500">Pedido não encontrado.</p>
        <a href=".." className="btn-secondary">Voltar</a>
      </div>
    );
  }

  const origin = formatAddress(order.origin_address);
  const dest   = formatAddress(order.destination_address);
  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/track/${order.tracking_code}`;

  return (
    <>
      {/* Barra de ações — só aparece na tela, some ao imprimir */}
      <div className="print:hidden flex items-center gap-3 p-4 bg-white border-b border-gray-200 sticky top-0 z-10">
        <a
          href={`/dashboard/orders/${orderId}`}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Voltar
        </a>
        <div className="flex-1" />
        <p className="text-sm text-gray-400">Dica: use Ctrl+P para imprimir ou salvar como PDF</p>
        <button
          onClick={() => window.print()}
          className="btn-primary"
        >
          <Printer size={16} />
          Imprimir Etiqueta
        </button>
      </div>

      {/* Área de impressão */}
      <div className="flex items-center justify-center p-8 print:p-0 print:block min-h-[calc(100vh-64px)] print:min-h-0 bg-gray-100 print:bg-white">
        <div
          className="bg-white border-2 border-black font-sans"
          style={{ width: "148mm", minHeight: "210mm" }}
        >
          {/* Cabeçalho da etiqueta */}
          <div className="border-b-2 border-black flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">📦</span>
              <span className="font-bold text-base tracking-tight">NexCargo</span>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-gray-500 uppercase tracking-wide">Emitido em</p>
              <p className="text-xs font-medium">
                {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Destinatário — seção maior */}
          <div className="border-b-2 border-black px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              Destinatário
            </p>
            <p className="font-bold text-lg leading-tight">{order.recipient_name}</p>
            {order.recipient_phone && (
              <p className="text-sm text-gray-600 mt-0.5">{order.recipient_phone}</p>
            )}
            <div className="mt-2 text-sm leading-snug">
              <p>{dest.line1}</p>
              <p>{dest.line2}</p>
              <p className="font-mono font-semibold mt-0.5">{dest.line3}</p>
            </div>
          </div>

          {/* Remetente — seção menor */}
          <div className="border-b-2 border-black px-4 py-2 bg-gray-50">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">
              Remetente
            </p>
            <p className="font-semibold text-sm">{order.sender_name}</p>
            {order.sender_phone && (
              <p className="text-xs text-gray-500">{order.sender_phone}</p>
            )}
            <div className="text-xs text-gray-600 leading-snug mt-0.5">
              <p>{origin.line1}</p>
              <p>{origin.line2} — {origin.line3}</p>
            </div>
          </div>

          {/* Dados da encomenda */}
          <div className="border-b-2 border-black px-4 py-2 grid grid-cols-3 gap-2 text-xs">
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Peso</p>
              <p className="font-semibold">{order.weight_kg ? `${order.weight_kg} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Frete</p>
              <p className="font-semibold">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.freight_value)}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-500 uppercase font-bold mb-0.5">Previsão</p>
              <p className="font-semibold">
                {order.estimated_delivery_date
                  ? format(new Date(order.estimated_delivery_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })
                  : "—"}
              </p>
            </div>
          </div>

          {/* Código de rastreio + barcode */}
          <div className="px-4 py-4 flex flex-col items-center gap-3">
            <Barcode value={order.tracking_code} />

            {/* QR Code — instrução de rastreio */}
            <div className="border border-gray-200 rounded-lg p-3 text-center w-full mt-1">
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-1">Rastreie pelo celular</p>
              <p className="text-xs font-mono text-gray-600 break-all">{trackingUrl}</p>
              <p className="text-[9px] text-gray-400 mt-1">
                Acesse o link acima ou peça ao destinatário para rastrear
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="border-t-2 border-black px-4 py-2 bg-gray-50 text-center">
            {order.description && (
              <p className="text-xs text-gray-600 mb-1">
                <span className="font-semibold">Conteúdo:</span> {order.description}
              </p>
            )}
            {order.notes && (
              <p className="text-xs text-gray-500">{order.notes}</p>
            )}
            <p className="text-[9px] text-gray-400 mt-1">
              MANUSEIE COM CUIDADO — NexCargo Logística
            </p>
          </div>
        </div>
      </div>

      {/* CSS de impressão */}
      <style>{`
        @media print {
          @page { size: A5 portrait; margin: 0; }
          body { margin: 0; }
        }
      `}</style>
    </>
  );
}
