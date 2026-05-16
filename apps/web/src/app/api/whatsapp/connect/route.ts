import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { evolutionClient } from "@/lib/evolution/client";

// POST /api/whatsapp/connect — Cria/reconecta instância WhatsApp do tenant
export async function POST(_request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ message: "Não autorizado." }, { status: 401 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("tenant_id, tenants(slug)")
    .eq("id", user.id)
    .single();

  if (!userData) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  const tenantSlug = (userData.tenants as any)?.slug as string;
  const instanceName = evolutionClient.instanceName(tenantSlug);

  try {
    // Cria a instância (se já existir, a API retorna a existente)
    await evolutionClient.createInstance(instanceName);

    // Busca o QR code
    const qrData = await evolutionClient.getQrCode(instanceName) as any;

    // Salva no banco
    await supabase.from("whatsapp_instances").upsert({
      tenant_id: userData.tenant_id,
      instance_name: instanceName,
      status: "connecting",
      qr_code: qrData.base64 ?? qrData.qrcode?.base64 ?? null,
    }, { onConflict: "tenant_id" });

    return NextResponse.json({
      qr_code: qrData.base64 ?? qrData.qrcode?.base64,
      instance_name: instanceName,
    });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Erro ao conectar WhatsApp." },
      { status: 500 }
    );
  }
}
