import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// POST /api/webhooks/evolution
// A Evolution API chama este endpoint toda vez que algo acontece no WhatsApp
// (mensagem recebida, status de entrega, conexão/desconexão, etc.)
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: true });

  const supabase = getSupabaseAdminClient();
  const { event, instance, data } = body;

  // Identifica o tenant pela instância (padrão: nexcargo-{slug})
  const tenantSlug = (instance as string)?.replace("nexcargo-", "");
  if (!tenantSlug) return NextResponse.json({ ok: true });

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .single();

  if (!tenant) return NextResponse.json({ ok: true });

  switch (event) {
    // Mensagem recebida de um cliente
    case "messages.upsert": {
      const messages = Array.isArray(data) ? data : [data];
      for (const msg of messages) {
        if (msg?.key?.fromMe) continue; // ignora mensagens enviadas pelo próprio sistema

        const phone = msg?.key?.remoteJid?.replace("@s.whatsapp.net", "");
        const text  = msg?.message?.conversation ?? msg?.message?.extendedTextMessage?.text ?? "";

        if (!phone || !text) continue;

        await supabase.from("whatsapp_messages").insert({
          tenant_id: tenant.id,
          direction: "inbound",
          phone_number: phone,
          content: text,
          external_id: msg?.key?.id,
          status: "delivered",
        });

        // Se o cliente mandou um código de rastreio, responde automaticamente
        const codeMatch = text.match(/\bNXC[0-9A-Z]+\b/i);
        if (codeMatch) {
          const code = codeMatch[0].toUpperCase();
          const { data: order } = await supabase
            .from("orders")
            .select("tracking_code, status, estimated_delivery_date")
            .eq("tenant_id", tenant.id)
            .eq("tracking_code", code)
            .single();

          if (order) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
            const trackUrl = `${appUrl}/track/${order.tracking_code}`;

            await supabase.from("notifications_log").insert({
              tenant_id: tenant.id,
              type: "whatsapp",
              trigger: "tracking_query",
              recipient: phone,
              status: "pending",
            });
          }
        }
      }
      break;
    }

    // Status de entrega de mensagem atualizado
    case "messages.update": {
      const updates = Array.isArray(data) ? data : [data];
      for (const upd of updates) {
        const status = upd?.update?.status;
        const externalId = upd?.key?.id;
        if (!status || !externalId) continue;

        const dbStatus =
          status === 2 ? "sent" :
          status === 3 ? "delivered" :
          status === 4 ? "read" : null;

        if (dbStatus) {
          await supabase
            .from("whatsapp_messages")
            .update({ status: dbStatus })
            .eq("external_id", externalId);
        }
      }
      break;
    }

    // WhatsApp conectado
    case "connection.update": {
      const state = data?.state;
      if (state === "open") {
        await supabase
          .from("whatsapp_instances")
          .update({ status: "connected", connected_at: new Date().toISOString() })
          .eq("tenant_id", tenant.id);
      } else if (state === "close") {
        await supabase
          .from("whatsapp_instances")
          .update({ status: "disconnected" })
          .eq("tenant_id", tenant.id);
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
