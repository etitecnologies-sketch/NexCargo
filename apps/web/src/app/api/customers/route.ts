import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  name:     z.string().min(2, "Nome obrigatório"),
  document: z.string().optional(),
  email:    z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone:    z.string().optional(),
  address:  z.object({
    street:       z.string().optional(),
    number:       z.string().optional(),
    complement:   z.string().optional(),
    neighborhood: z.string().optional(),
    city:         z.string().optional(),
    state:        z.string().optional(),
    zip:          z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page     = parseInt(searchParams.get("page") ?? "1");
  const per_page = parseInt(searchParams.get("per_page") ?? "20");
  const search   = searchParams.get("search") ?? "";
  const offset   = (page - 1) * per_page;

  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .order("name")
    .range(offset, offset + per_page - 1);

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,document.ilike.%${search}%`);
  }

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ message: "Erro ao buscar clientes." }, { status: 500 });

  return NextResponse.json({ data, total: count ?? 0, page, per_page, total_pages: Math.ceil((count ?? 0) / per_page) });
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ message: "Não autorizado." }, { status: 401 });

  try {
    const body = await request.json();
    const payload = createSchema.parse(body);

    const { data: userData } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
    if (!userData) return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });

    // Remove e-mail vazio antes de salvar
    const cleanPayload = { ...payload, email: payload.email || undefined };

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({ ...cleanPayload, tenant_id: userData.tenant_id })
      .select()
      .single();

    if (error) return NextResponse.json({ message: "Erro ao criar cliente." }, { status: 500 });

    return NextResponse.json({ data: customer, message: "Cliente criado com sucesso." }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ message: "Dados inválidos.", details: err.flatten().fieldErrors }, { status: 400 });
    return NextResponse.json({ message: "Erro interno." }, { status: 500 });
  }
}
