import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Chamado pelo Supabase após confirmação de e-mail ou reset de senha
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(new URL(`/login?error=${errorParam}`, request.url));
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(new URL("/login?error=auth_callback_failed", request.url));
}
