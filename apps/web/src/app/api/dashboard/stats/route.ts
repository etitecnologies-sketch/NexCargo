import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/dashboard/stats — Métricas em tempo real para os cards do dashboard
export async function GET(_request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO      = today.toISOString();
  const yesterdayISO  = new Date(today.getTime() - 86400000).toISOString();

  // Todas as contagens em paralelo para velocidade máxima
  const [
    ordersToday,
    ordersYesterday,
    inTransit,
    inTransitYesterday,
    deliveredTotal,
    deliveredYesterday,
    slaAtRisk,
    slaLate,
    slaOk,
  ] = await Promise.all([
    // Pedidos criados hoje
    supabase.from("orders").select("*", { count: "exact", head: true })
      .gte("created_at", todayISO),

    // Pedidos criados ontem (para calcular variação %)
    supabase.from("orders").select("*", { count: "exact", head: true })
      .gte("created_at", yesterdayISO)
      .lt("created_at", todayISO),

    // Pedidos em trânsito agora
    supabase.from("orders").select("*", { count: "exact", head: true })
      .in("status", ["collected", "in_transit", "out_for_delivery"]),

    // Em trânsito ontem
    supabase.from("orders").select("*", { count: "exact", head: true })
      .in("status", ["collected", "in_transit", "out_for_delivery"])
      .lt("created_at", todayISO),

    // Total entregues este mês
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .gte("delivered_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),

    // Entregues no mês passado (para variação)
    supabase.from("orders").select("*", { count: "exact", head: true })
      .eq("status", "delivered")
      .gte("delivered_at", new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString())
      .lt("delivered_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString()),

    // SLA em risco (prazo vence em até 2 dias e não entregue)
    supabase.from("orders").select("*", { count: "exact", head: true })
      .not("status", "in", '("delivered","cancelled","returned")')
      .lte("estimated_delivery_date", new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0])
      .gte("estimated_delivery_date", todayISO.split("T")[0]),

    // SLA vencido (prazo passou e não entregue)
    supabase.from("orders").select("*", { count: "exact", head: true })
      .not("status", "in", '("delivered","cancelled","returned")')
      .lt("estimated_delivery_date", todayISO.split("T")[0]),

    // SLA ok (em dia)
    supabase.from("orders").select("*", { count: "exact", head: true })
      .not("status", "in", '("delivered","cancelled","returned")')
      .gt("estimated_delivery_date", new Date(today.getTime() + 2 * 86400000).toISOString().split("T")[0]),
  ]);

  function pct(current: number, previous: number) {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const diff = ((current - previous) / previous) * 100;
    return `${diff >= 0 ? "+" : ""}${diff.toFixed(0)}%`;
  }

  return NextResponse.json({
    orders_today:    { value: ordersToday.count ?? 0,    change: pct(ordersToday.count ?? 0, ordersYesterday.count ?? 0) },
    in_transit:      { value: inTransit.count ?? 0,      change: pct(inTransit.count ?? 0, inTransitYesterday.count ?? 0) },
    delivered_month: { value: deliveredTotal.count ?? 0, change: pct(deliveredTotal.count ?? 0, deliveredYesterday.count ?? 0) },
    sla: {
      at_risk:     slaAtRisk.count ?? 0,
      late:        slaLate.count ?? 0,
      ok:          slaOk.count ?? 0,
      total_active: (slaOk.count ?? 0) + (slaAtRisk.count ?? 0) + (slaLate.count ?? 0),
    },
  });
}
