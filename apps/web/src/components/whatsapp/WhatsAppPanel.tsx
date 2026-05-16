"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MessageSquare, Wifi, WifiOff, Loader2, RefreshCw,
  CheckCircle2, AlertCircle, Smartphone,
} from "lucide-react";
import { clsx } from "clsx";

type WaStatus = "connected" | "connecting" | "disconnected" | "error";

interface StatusInfo {
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const STATUS_INFO: Record<WaStatus, StatusInfo> = {
  connected:    { label: "Conectado",      description: "WhatsApp ativo e enviando mensagens.",    icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50"  },
  connecting:   { label: "Conectando...",  description: "Aguardando leitura do QR code.",          icon: Loader2,      color: "text-amber-600",  bg: "bg-amber-50"  },
  disconnected: { label: "Desconectado",   description: "Nenhum número conectado ao sistema.",     icon: WifiOff,      color: "text-gray-500",   bg: "bg-gray-100"  },
  error:        { label: "Erro",           description: "Falha na conexão com a Evolution API.",   icon: AlertCircle,  color: "text-danger-500", bg: "bg-danger-50" },
};

export function WhatsAppPanel() {
  const [status, setStatus]   = useState<WaStatus>("disconnected");
  const [qrCode, setQrCode]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (!res.ok) return;
      const json = await res.json();
      setStatus(json.status as WaStatus);
      if (json.status === "connected") setQrCode(null);
    } catch {
      // silencioso — não interrompe a UI
    }
  }, []);

  // Verifica status ao montar e a cada 5s quando está conectando
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status !== "connecting") return;
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [status, fetchStatus]);

  async function handleConnect() {
    setLoading(true);
    setQrCode(null);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      const json = await res.json();
      if (json.qr_code) {
        setQrCode(json.qr_code);
        setStatus("connecting");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const info = STATUS_INFO[status];
  const Icon = info.icon;
  const isConnected = status === "connected";

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Conecte o número da empresa para enviar notificações automáticas.
        </p>
      </div>

      {/* Card de status */}
      <div className="card">
        <div className="flex items-start gap-4">
          <div className={clsx("p-3 rounded-xl flex-shrink-0", info.bg)}>
            <Icon
              size={22}
              className={clsx(info.color, status === "connecting" && "animate-spin")}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900">{info.label}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{info.description}</p>
          </div>
          <button
            onClick={fetchStatus}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
            title="Verificar status"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Botão de conectar / reconectar */}
        {!isConnected && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleConnect}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Gerando QR Code...</>
              ) : (
                <><Smartphone size={15} /> {status === "disconnected" ? "Conectar WhatsApp" : "Gerar Novo QR Code"}</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* QR Code */}
      {qrCode && !isConnected && (
        <div className="card text-center">
          <Smartphone size={20} className="text-brand-500 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800 mb-1">Escaneie o QR Code</h3>
          <p className="text-gray-500 text-sm mb-4">
            Abra o WhatsApp no celular → <strong>Aparelhos conectados</strong> → <strong>Conectar aparelho</strong>
          </p>
          <div className="inline-flex p-3 bg-white border-2 border-gray-200 rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrCode}
              alt="QR Code WhatsApp"
              width={200}
              height={200}
              className="rounded-lg"
            />
          </div>
          <p className="text-gray-400 text-xs mt-3">
            QR Code expira em 60 segundos. Verificando conexão automaticamente...
          </p>
        </div>
      )}

      {/* Informações do que é automático */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-500" />
          Mensagens Automáticas
        </h3>
        <p className="text-gray-500 text-sm mb-4">
          Quando conectado, o sistema envia mensagens automaticamente para o destinatário
          a cada atualização de status do pedido:
        </p>
        <div className="space-y-2">
          {[
            { trigger: "Pedido criado",       msg: "Confirmação + link de rastreio" },
            { trigger: "Coletado",            msg: "Aviso de coleta realizada" },
            { trigger: "Em trânsito",         msg: "Estimativa de entrega" },
            { trigger: "Saiu para entrega",   msg: "Alerta para ficar em casa" },
            { trigger: "Entregue",            msg: "Confirmação de entrega" },
            { trigger: "Falha na entrega",    msg: "Aviso + próximos passos" },
          ].map((item) => (
            <div key={item.trigger} className="flex items-center gap-3 text-sm">
              <div className={clsx(
                "w-2 h-2 rounded-full flex-shrink-0",
                isConnected ? "bg-green-500" : "bg-gray-300"
              )} />
              <span className="font-medium text-gray-700 w-36 flex-shrink-0">{item.trigger}</span>
              <span className="text-gray-500">{item.msg}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <strong>Rastreio automático:</strong> Se um cliente enviar o código de rastreio via WhatsApp,
            o sistema responde automaticamente com o status atualizado.
          </p>
        </div>
      </div>

      {/* Webhook URL para configurar na Evolution API */}
      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-2 text-sm">Configuração do Webhook</h3>
        <p className="text-gray-500 text-xs mb-3">
          Configure este endereço na Evolution API para receber mensagens e atualizações de status:
        </p>
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
          <code className="text-xs text-gray-700 flex-1 break-all">
            {process.env.NEXT_PUBLIC_APP_URL ?? "https://seu-dominio.com"}/api/webhooks/evolution
          </code>
          <button
            onClick={() => navigator.clipboard.writeText(
              `${window.location.origin}/api/webhooks/evolution`
            )}
            className="text-xs text-brand-600 hover:underline flex-shrink-0"
          >
            Copiar
          </button>
        </div>
      </div>
    </div>
  );
}
