import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/orders/[id] — Busca pedido completo com histórico de eventos
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      events:order_events(*)
    `)
    .eq("id", params.id)
    .order("occurred_at", { ascending: false, referencedTable: "order_events" })
    .single();

  if (error || !order) {
    return NextResponse.json({ message: "Pedido não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ data: order });
}
