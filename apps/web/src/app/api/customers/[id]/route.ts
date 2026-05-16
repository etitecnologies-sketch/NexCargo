import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  name:     z.string().min(2).optional(),
  document: z.string().optional(),
  email:    z.string().email().optional().or(z.literal("")),
  phone:    z.string().optional(),
  address:  z.record(z.string()).optional(),
  notes:    z.string().optional(),
  is_active: z.boolean().optional(),
});

// GET /api/customers/[id] — Busca cliente com seus pedidos
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { data: customer, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !customer) return NextResponse.json({ message: "Cliente não encontrado." }, { status: 404 });

  // Pedidos onde é remetente ou destinatário
  const { data: orders } = await supabase
    .from("orders")
    .select("id, tracking_code, status, recipient_name, sender_name, destination_address, created_at, total_value")
    .or(`sender_id.eq.${params.id},recipient_id.eq.${params.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ data: { ...customer, orders: orders ?? [] } });
}

// PATCH /api/customers/[id] — Atualiza cliente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  try {
    const body = await request.json();
    const payload = updateSchema.parse(body);

    const { data, error } = await supabase
      .from("customers")
      .update({ ...payload, email: payload.email || undefined })
      .eq("id", params.id)
      .select()
      .single();

    if (error || !data) return NextResponse.json({ message: "Erro ao atualizar." }, { status: 500 });
    return NextResponse.json({ data, message: "Cliente atualizado." });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}

// DELETE /api/customers/[id] — Desativa cliente (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  await supabase.from("customers").update({ is_active: false }).eq("id", params.id);
  return NextResponse.json({ message: "Cliente removido." });
}
