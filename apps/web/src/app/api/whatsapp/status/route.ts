import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { evolutionClient } from "@/lib/evolution/client";

// GET /api/whatsapp/status — Verifica status da conexão do WhatsApp
export async function GET(_request: NextRequest) {
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
    const statusData = await evolutionClient.getStatus(instanceName) as any;
    const state: string = statusData?.instance?.state ?? "disconnected";

    const isConnected = state === "open";
    const newStatus = isConnected ? "connected" : state === "connecting" ? "connecting" : "disconnected";

    // Atualiza no banco
    await supabase
      .from("whatsapp_instances")
      .upsert({
        tenant_id: userData.tenant_id,
        instance_name: instanceName,
        status: newStatus,
        connected_at: isConnected ? new Date().toISOString() : null,
      }, { onConflict: "tenant_id" });

    return NextResponse.json({ status: newStatus, instance_name: instanceName });
  } catch {
    return NextResponse.json({ status: "disconnected", instance_name: instanceName });
  }
}
