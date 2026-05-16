import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Retorna o usuário logado ou redireciona para /login
// Usar em Server Components e API Routes que exigem autenticação
export async function requireAuth() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Busca dados completos do usuário incluindo tenant
  const { data: userData } = await supabase
    .from("users")
    .select("*, tenants(*)")
    .eq("id", user.id)
    .single();

  return { supabase, user, userData };
}

// Retorna usuário sem redirecionar (para componentes que precisam checar mas não obrigar)
export async function getSession() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
