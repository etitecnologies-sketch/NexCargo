import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/reports/summary?from=...&to=... — Resumo gerencial por período
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const to   = searchParams.get("to")   ?? new Date().toISOString();

  const { data: orders } = await supabase
    .from("orders")
    .select("status, freight_value, total_value, estimated_delivery_date, delivered_at, created_at")
    .gte("created_at", from)
    .lte("created_at", to + (to.includes("T") ? "" : "T23:59:59"));

  if (!orders) return NextResponse.json({ message: "Erro." }, { status: 500 });

  const total         = orders.length;
  const delivered     = orders.filter((o) => o.status === "delivered").length;
  const failed        = orders.filter((o) => o.status === "failed").length;
  const cancelled     = orders.filter((o) => o.status === "cancelled").length;
  const in_progress   = orders.filter((o) => !["delivered","failed","cancelled","returned"].includes(o.status)).length;
  const total_revenue = orders.reduce((s, o) => s + (o.total_value ?? 0), 0);
  const total_freight = orders.reduce((s, o) => s + (o.freight_value ?? 0), 0);
  const delivery_rate = total > 0 ? ((delivered / total) * 100).toFixed(1) : "0.0";

  // SLA: pedidos com data prevista que foram entregues no prazo
  const withDeadline = orders.filter((o) => o.estimated_delivery_date && o.delivered_at);
  const onTime = withDeadline.filter((o) => new Date(o.delivered_at!) <= new Date(o.estimated_delivery_date!)).length;
  const sla_rate = withDeadline.length > 0 ? ((onTime / withDeadline.length) * 100).toFixed(1) : "N/A";

  // Contagem por status
  const by_status: Record<string, number> = {};
  for (const o of orders) {
    by_status[o.status] = (by_status[o.status] ?? 0) + 1;
  }

  return NextResponse.json({
    period: { from, to },
    totals: { total, delivered, failed, cancelled, in_progress },
    financial: { total_revenue, total_freight, avg_ticket: total > 0 ? total_revenue / total : 0 },
    rates: { delivery_rate: `${delivery_rate}%`, sla_rate: sla_rate === "N/A" ? "N/A" : `${sla_rate}%` },
    by_status,
  });
}
