-- ===========================================
-- NEXCARGO — GATILHO DE NOVO USUÁRIO
-- Migração 004 — Vincula Supabase Auth ao banco
-- ===========================================
-- O que faz?
-- Toda vez que alguém cria uma conta pelo Supabase Auth,
-- este gatilho cria automaticamente:
--   1. Um "tenant" (empresa) para esse usuário
--   2. Um registro de usuário na tabela public.users
--
-- Sem isso, o login funciona mas o sistema não encontra
-- os dados do usuário no banco (tenant, permissões, etc.)
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  tenant_slug TEXT;
BEGIN
  -- Extrai o nome do usuário (do metadata ou do email)
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Gera o slug da empresa baseado no email
  tenant_slug := regexp_replace(
    lower(split_part(NEW.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  ) || '-' || substr(NEW.id::text, 1, 8);

  -- Cria o tenant (empresa) para o novo usuário
  INSERT INTO public.tenants (name, slug, plan)
  VALUES (
    user_name || ' - Empresa',
    tenant_slug,
    'trial'
  )
  RETURNING id INTO new_tenant_id;

  -- Cria o registro do usuário no banco com o mesmo ID do Supabase Auth
  INSERT INTO public.users (id, tenant_id, email, full_name, role)
  VALUES (
    NEW.id,
    new_tenant_id,
    NEW.email,
    user_name,
    'owner'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Registra o gatilho para disparar após cada novo usuário no Supabase Auth
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
