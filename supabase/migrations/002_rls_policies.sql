-- ===========================================
-- NEXCARGO — ROW LEVEL SECURITY (RLS)
-- Migração 002 — Segurança multi-tenant
-- ===========================================
-- O que é RLS?
-- É como um porteiro do banco de dados.
-- Mesmo que um código tente pegar dados de outra empresa,
-- o próprio banco bloqueia — garantia dupla de segurança!
-- ===========================================

-- Habilita RLS em todas as tabelas sensíveis
ALTER TABLE tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels              ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log   ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- FUNÇÃO AUXILIAR: pega o tenant_id do usuário logado
-- Busca diretamente na tabela users usando o ID do Supabase Auth
-- SECURITY DEFINER = roda como admin, evitando conflito com RLS
-- ===========================================
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1),
    'viewer'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;

-- ===========================================
-- POLICIES: Usuários só veem dados do SEU tenant
-- ===========================================

-- TENANTS: só o próprio tenant
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL USING (id = auth.tenant_id());

-- USERS: só usuários do mesmo tenant
CREATE POLICY "users_tenant_isolation" ON users
  FOR ALL USING (tenant_id = auth.tenant_id());

-- CUSTOMERS: só do mesmo tenant
CREATE POLICY "customers_tenant_isolation" ON customers
  FOR ALL USING (tenant_id = auth.tenant_id());

-- ORDERS: só do mesmo tenant
CREATE POLICY "orders_tenant_isolation" ON orders
  FOR ALL USING (tenant_id = auth.tenant_id());

-- ORDER_EVENTS: só do mesmo tenant
CREATE POLICY "order_events_tenant_isolation" ON order_events
  FOR ALL USING (tenant_id = auth.tenant_id());

-- LABELS: só do mesmo tenant
CREATE POLICY "labels_tenant_isolation" ON labels
  FOR ALL USING (tenant_id = auth.tenant_id());

-- WHATSAPP_INSTANCES: só do mesmo tenant
CREATE POLICY "whatsapp_instances_tenant_isolation" ON whatsapp_instances
  FOR ALL USING (tenant_id = auth.tenant_id());

-- WHATSAPP_MESSAGES: só do mesmo tenant
CREATE POLICY "whatsapp_messages_tenant_isolation" ON whatsapp_messages
  FOR ALL USING (tenant_id = auth.tenant_id());

-- NOTIFICATIONS_LOG: só do mesmo tenant
CREATE POLICY "notifications_log_tenant_isolation" ON notifications_log
  FOR ALL USING (tenant_id = auth.tenant_id());

-- ===========================================
-- ROLES de permissão dentro do tenant
-- owner/admin: tudo
-- operator: criar/editar pedidos, não excluir
-- viewer: só visualizar
-- ===========================================

-- Operadores NÃO podem excluir pedidos
CREATE POLICY "operators_no_delete_orders" ON orders
  FOR DELETE USING (auth.user_role() IN ('owner', 'admin'));

-- Viewers só podem ler
CREATE POLICY "viewers_readonly_orders" ON orders
  FOR INSERT WITH CHECK (auth.user_role() != 'viewer');

CREATE POLICY "viewers_readonly_customers" ON customers
  FOR INSERT WITH CHECK (auth.user_role() != 'viewer');
