import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// GET /api/track/[code] — Endpoint público de rastreamento
// Não requer login — qualquer pessoa com o código pode consultar
export async function GET(
  _request: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = getSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      tracking_code,
      status,
      recipient_name,
      destination_address,
      estimated_delivery_date,
      delivered_at,
      created_at,
      events:order_events(
        id, status, description, location, occurred_at
      )
    `)
    .eq("tracking_code", params.code.toUpperCase())
    .order("occurred_at", { ascending: false, referencedTable: "order_events" })
    .single();

  if (error || !order) {
    return NextResponse.json(
      { message: "Código de rastreio não encontrado." },
      { status: 404 }
    );
  }

  // Retorna apenas campos necessários — sem dados sensíveis
  return NextResponse.json({ data: order }, {
    headers: {
      // Cache de 30 segundos — rastreio deve ser relativamente atualizado
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}
