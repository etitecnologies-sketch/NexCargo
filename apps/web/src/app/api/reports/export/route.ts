import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/reports/export?from=2024-01-01&to=2024-12-31&status=delivered
// Gera um arquivo CSV para download direto no browser
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from   = searchParams.get("from");
  const to     = searchParams.get("to");
  const status = searchParams.get("status");

  let query = supabase
    .from("orders")
    .select("tracking_code, sender_name, sender_phone, recipient_name, recipient_phone, destination_address, status, freight_value, total_value, estimated_delivery_date, delivered_at, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (from)   query = query.gte("created_at", from);
  if (to)     query = query.lte("created_at", to + "T23:59:59");
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ message: "Erro ao gerar relatório." }, { status: 500 });

  // Mapeamento de status para português
  const statusPt: Record<string, string> = {
    pending: "Aguardando", collected: "Coletado", in_transit: "Em Trânsito",
    out_for_delivery: "Saiu p/ Entrega", delivered: "Entregue",
    failed: "Falha", returned: "Devolvido", cancelled: "Cancelado",
  };

  // Monta o CSV linha por linha
  const header = [
    "Código Rastreio", "Remetente", "Telefone Remetente",
    "Destinatário", "Telefone Destinatário", "Cidade Destino", "Estado Destino",
    "Status", "Frete (R$)", "Total (R$)", "Previsão Entrega", "Entregue Em", "Criado Em",
  ].join(";");

  const rows = (data ?? []).map((o) => {
    const dest = o.destination_address as { city?: string; state?: string } | null;
    const fmt = (v: string | null | undefined) => (v ? `"${v.replace(/"/g, '""')}"` : "");
    const fmtNum = (v: number | null) => (v != null ? String(v).replace(".", ",") : "");
    const fmtDate = (v: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR") : "");

    return [
      fmt(o.tracking_code), fmt(o.sender_name), fmt(o.sender_phone),
      fmt(o.recipient_name), fmt(o.recipient_phone),
      fmt(dest?.city), fmt(dest?.state),
      fmt(statusPt[o.status] ?? o.status),
      fmtNum(o.freight_value), fmtNum(o.total_value),
      fmtDate(o.estimated_delivery_date), fmtDate(o.delivered_at), fmtDate(o.created_at),
    ].join(";");
  });

  const csv = "﻿" + [header, ...rows].join("\n"); // ﻿ = BOM para Excel abrir com acentos corretos

  const filename = `nexcargo-pedidos-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
