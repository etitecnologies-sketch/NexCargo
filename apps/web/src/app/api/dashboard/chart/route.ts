import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/dashboard/chart — Dados dos últimos 7 dias para o gráfico
export async function GET(_request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const days: { day: string; date: string; entregues: number; tentativas: number }[] = [];
  const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Para cada um dos últimos 7 dias, conta entregas e tentativas
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date.getTime() + 86400000);

    const [delivered, attempts] = await Promise.all([
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered")
        .gte("delivered_at", date.toISOString())
        .lt("delivered_at", nextDate.toISOString()),

      supabase
        .from("order_events")
        .select("*", { count: "exact", head: true })
        .eq("status", "out_for_delivery")
        .gte("occurred_at", date.toISOString())
        .lt("occurred_at", nextDate.toISOString()),
    ]);

    days.push({
      day: i === 0 ? "Hoje" : DAY_NAMES[date.getDay()],
      date: date.toISOString().split("T")[0],
      entregues: delivered.count ?? 0,
      tentativas: attempts.count ?? 0,
    });
  }

  return NextResponse.json({ data: days });
}
