// Cliente para a Evolution API — é o que faz o sistema "falar" com o WhatsApp

const BASE_URL = process.env.EVOLUTION_API_URL ?? "http://localhost:8080";
const API_KEY  = process.env.EVOLUTION_API_KEY ?? "";

async function evolutionFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: API_KEY,
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Evolution API error ${res.status}`);
  }

  return res.json();
}

export const evolutionClient = {
  // Cria uma nova instância (conexão WhatsApp) para um tenant
  createInstance(instanceName: string) {
    return evolutionFetch("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      }),
    });
  },

  // Busca o QR code para escanear
  getQrCode(instanceName: string): Promise<{ base64: string; code: string }> {
    return evolutionFetch(`/instance/connect/${instanceName}`);
  },

  // Verifica o estado da conexão
  getStatus(instanceName: string): Promise<{ instance: { state: string } }> {
    return evolutionFetch(`/instance/connectionState/${instanceName}`);
  },

  // Desconecta o WhatsApp
  disconnect(instanceName: string) {
    return evolutionFetch(`/instance/logout/${instanceName}`, { method: "DELETE" });
  },

  // Envia mensagem de texto
  sendText(instanceName: string, phone: string, text: string) {
    return evolutionFetch(`/message/sendText/${instanceName}`, {
      method: "POST",
      body: JSON.stringify({ number: phone, text }),
    });
  },

  // Monta o nome da instância de um tenant (padrão: nexcargo-{slug})
  instanceName(tenantSlug: string) {
    return `nexcargo-${tenantSlug}`;
  },
};

// Templates de mensagem para cada evento de pedido
export const whatsappTemplates = {
  pending: (name: string, code: string, trackUrl: string) =>
    `⏳ Olá *${name}*!\n\nSeu pedido foi registrado com sucesso.\n\n🔖 Código: *${code}*\n\nAcompanhe em tempo real:\n${trackUrl}`,

  collected: (name: string, code: string, trackUrl: string) =>
    `📦 Olá *${name}*!\n\nSua encomenda *${code}* foi coletada e está sendo processada.\n\nRastreie: ${trackUrl}`,

  in_transit: (name: string, code: string, date: string, trackUrl: string) =>
    `🚛 *${name}*, sua encomenda *${code}* está em trânsito!\n\nPrevisão de entrega: *${date}*\n\nAcompanhe: ${trackUrl}`,

  out_for_delivery: (name: string, code: string, trackUrl: string) =>
    `🚀 Ótimas notícias, *${name}*!\n\nSua encomenda *${code}* *saiu para entrega hoje!*\n\nFique em casa e aguarde o entregador.\n\nRastreie: ${trackUrl}`,

  delivered: (name: string, code: string) =>
    `✅ *${name}*, sua encomenda *${code}* foi entregue com sucesso!\n\nObrigado por confiar na *NexCargo*. 📦`,

  failed: (name: string, code: string, trackUrl: string) =>
    `⚠️ *${name}*, infelizmente não conseguimos entregar *${code}* hoje.\n\nFaremos uma nova tentativa em breve.\n\nDúvidas? Acesse: ${trackUrl}`,
};
