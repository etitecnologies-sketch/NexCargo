import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateStatusSchema = z.object({
  status: z.enum([
    "pending", "collected", "in_transit",
    "out_for_delivery", "delivered", "failed",
    "returned", "cancelled"
  ]),
  description: z.string().min(1, "Descrição obrigatória"),
  location: z.string().optional(),
});

// PATCH /api/orders/[id]/status — Atualiza status do pedido
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { status, description, location } = updateStatusSchema.parse(body);

    // Atualiza o status do pedido
    const updateData: Record<string, unknown> = { status };
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    }

    const { data: order, error: updateError } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", params.id)
      .select("tenant_id")
      .single();

    if (updateError || !order) {
      return NextResponse.json({ message: "Pedido não encontrado." }, { status: 404 });
    }

    // Registra o evento no histórico
    await supabase.from("order_events").insert({
      order_id: params.id,
      tenant_id: order.tenant_id,
      status,
      description,
      location,
      created_by: user.id,
    });

    // Registra notificação pendente (o N8N vai processar)
    await supabase.from("notifications_log").insert({
      tenant_id: order.tenant_id,
      order_id: params.id,
      type: "whatsapp",
      trigger: status,
      recipient: "pending", // preenchido pelo N8N
    });

    return NextResponse.json({ message: "Status atualizado com sucesso." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dados inválidos.", details: error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
