import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Schema de validação para criar pedido
const createOrderSchema = z.object({
  sender_name: z.string().min(2, "Nome do remetente obrigatório"),
  sender_phone: z.string().optional(),
  recipient_name: z.string().min(2, "Nome do destinatário obrigatório"),
  recipient_phone: z.string().optional(),
  origin_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(8),
  }),
  destination_address: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().length(2),
    zip: z.string().min(8),
  }),
  description: z.string().optional(),
  weight_kg: z.number().positive().optional(),
  declared_value: z.number().nonnegative().optional(),
  freight_value: z.number().nonnegative().default(0),
  estimated_delivery_date: z.string().optional(),
  notes: z.string().optional(),
});

// GET /api/orders — Lista pedidos do tenant
export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const offset = (page - 1) * per_page;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + per_page - 1);

  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(
      `tracking_code.ilike.%${search}%,recipient_name.ilike.%${search}%,sender_name.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: "Erro ao buscar pedidos." }, { status: 500 });
  }

  return NextResponse.json({
    data,
    total: count ?? 0,
    page,
    per_page,
    total_pages: Math.ceil((count ?? 0) / per_page),
  });
}

// POST /api/orders — Cria novo pedido
export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const orderData = createOrderSchema.parse(body);

    // Busca o tenant_id do usuário logado
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
    }

    // Gera o código de rastreio
    const trackingCode = await generateTrackingCode(supabase, userData.tenant_id);

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        ...orderData,
        tenant_id: userData.tenant_id,
        tracking_code: trackingCode,
        total_value: orderData.freight_value + (orderData.declared_value ? orderData.declared_value * 0.02 : 0),
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: "Erro ao criar pedido." }, { status: 500 });
    }

    // Registra o evento inicial
    await supabase.from("order_events").insert({
      order_id: order.id,
      tenant_id: userData.tenant_id,
      status: "pending",
      description: "Pedido criado e aguardando coleta.",
      created_by: user.id,
    });

    return NextResponse.json({ data: order, message: "Pedido criado com sucesso." }, { status: 201 });
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

// Gera código de rastreio único: NXC + ANO + SEQUÊNCIA + UF
async function generateTrackingCode(supabase: any, tenantId: string): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  const sequence = String((count ?? 0) + 1).padStart(6, "0");
  return `NXC${year}${sequence}`;
}
