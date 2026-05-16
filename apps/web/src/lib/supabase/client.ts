import { createBrowserClient } from "@supabase/ssr";

// Este arquivo cria a "ponte" entre o frontend e o Supabase
// É como um telefone que o browser usa pra ligar pro banco de dados

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas. " +
      "Verifique seu arquivo .env.local"
    );
  }

  client = createBrowserClient(url, key);
  return client;
}
