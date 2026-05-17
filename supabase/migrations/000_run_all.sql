-- ===========================================
-- NEXCARGO — SETUP COMPLETO DO BANCO
-- ===========================================


-- ====================================================
-- PARTE 1: SCHEMA INICIAL (tabelas e índices)
-- ====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'enterprise')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  settings    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)
);

CREATE TABLE IF NOT EXISTS customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  document      TEXT,
  email         TEXT,
  phone         TEXT,
  address       JSONB,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id             UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tracking_code         TEXT NOT NULL,
  sender_id             UUID REFERENCES customers(id),
  recipient_id          UUID REFERENCES customers(id),
  sender_name           TEXT NOT NULL,
  sender_phone          TEXT,
  recipient_name        TEXT NOT NULL,
  recipient_phone       TEXT,
  origin_address        JSONB NOT NULL,
  destination_address   JSONB NOT NULL,
  description           TEXT,
  weight_kg             DECIMAL(10,3),
  dimensions            JSONB,
  declared_value        DECIMAL(10,2),
  freight_value         DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_value       DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value           DECIMAL(10,2) NOT NULL DEFAULT 0,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','collected','in_transit','out_for_delivery',
    'delivered','failed','returned','cancelled'
  )),
  estimated_delivery_date DATE,
  delivered_at          TIMESTAMPTZ,
  created_by            UUID REFERENCES users(id),
  assigned_to           UUID REFERENCES users(id),
  notes                 TEXT,
  metadata              JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tenant_id, tracking_code);

CREATE TABLE IF NOT EXISTS order_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  description TEXT NOT NULL,
  location    TEXT,
  latitude    DECIMAL(10,8),
  longitude   DECIMAL(11,8),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES users(id),
  metadata    JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS labels (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label_url     TEXT,
  barcode       TEXT NOT NULL,
  printed_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS whatsapp_instances (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,
  phone_number  TEXT,
  status        TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN (
    'disconnected','connecting','connected','error'
  )),
  qr_code       TEXT,
  connected_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id)
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id),
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone_number    TEXT NOT NULL,
  message_type    TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text','image','document','template')),
  content         TEXT NOT NULL,
  template_name   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','sent','delivered','read','failed'
  )),
  external_id     TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id),
  type        TEXT NOT NULL CHECK (type IN ('whatsapp','email','sms','push')),
  trigger     TEXT NOT NULL,
  recipient   TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending',
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_tenant      ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created     ON orders(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_customers_tenant   ON customers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone    ON customers(tenant_id, phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages  ON whatsapp_messages(tenant_id, created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tenants_updated_at   ON tenants;
DROP TRIGGER IF EXISTS trg_users_updated_at     ON users;
DROP TRIGGER IF EXISTS trg_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS trg_orders_updated_at    ON orders;
DROP TRIGGER IF EXISTS trg_whatsapp_updated_at  ON whatsapp_instances;

CREATE TRIGGER trg_tenants_updated_at   BEFORE UPDATE ON tenants   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_whatsapp_updated_at  BEFORE UPDATE ON whatsapp_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ====================================================
-- PARTE 2: FUNÇÕES AUXILIARES (no schema public)
-- Funções que identificam o tenant e o papel do usuário logado
-- SECURITY DEFINER = roda como admin, evitando conflito com RLS
-- ====================================================

CREATE OR REPLACE FUNCTION public.get_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1),
    'viewer'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth;


-- ====================================================
-- PARTE 3: SEGURANÇA (RLS — cada empresa vê só os seus dados)
-- ====================================================

ALTER TABLE tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders              ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels              ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances  ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log   ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tenant_isolation"                    ON tenants;
DROP POLICY IF EXISTS "users_tenant_isolation"              ON users;
DROP POLICY IF EXISTS "customers_tenant_isolation"          ON customers;
DROP POLICY IF EXISTS "orders_tenant_isolation"             ON orders;
DROP POLICY IF EXISTS "order_events_tenant_isolation"       ON order_events;
DROP POLICY IF EXISTS "labels_tenant_isolation"             ON labels;
DROP POLICY IF EXISTS "whatsapp_instances_tenant_isolation" ON whatsapp_instances;
DROP POLICY IF EXISTS "whatsapp_messages_tenant_isolation"  ON whatsapp_messages;
DROP POLICY IF EXISTS "notifications_log_tenant_isolation"  ON notifications_log;
DROP POLICY IF EXISTS "operators_no_delete_orders"          ON orders;
DROP POLICY IF EXISTS "viewers_readonly_orders"             ON orders;
DROP POLICY IF EXISTS "viewers_readonly_customers"          ON customers;

CREATE POLICY "tenant_isolation"                    ON tenants             FOR ALL USING (id = public.get_tenant_id());
CREATE POLICY "users_tenant_isolation"              ON users               FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "customers_tenant_isolation"          ON customers           FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "orders_tenant_isolation"             ON orders              FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "order_events_tenant_isolation"       ON order_events        FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "labels_tenant_isolation"             ON labels              FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "whatsapp_instances_tenant_isolation" ON whatsapp_instances  FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "whatsapp_messages_tenant_isolation"  ON whatsapp_messages   FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "notifications_log_tenant_isolation"  ON notifications_log   FOR ALL USING (tenant_id = public.get_tenant_id());
CREATE POLICY "operators_no_delete_orders"          ON orders              FOR DELETE USING (public.get_user_role() IN ('owner', 'admin'));
CREATE POLICY "viewers_readonly_orders"             ON orders              FOR INSERT WITH CHECK (public.get_user_role() != 'viewer');
CREATE POLICY "viewers_readonly_customers"          ON customers           FOR INSERT WITH CHECK (public.get_user_role() != 'viewer');


-- ====================================================
-- PARTE 4: GATILHO — cria empresa+usuário automaticamente
-- ao criar conta no Supabase Auth
-- ====================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  new_tenant_id UUID;
  user_name TEXT;
  tenant_slug TEXT;
  slug_base TEXT;
  slug_counter INT := 0;
BEGIN
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  slug_base := regexp_replace(
    lower(split_part(NEW.email, '@', 1)),
    '[^a-z0-9]', '-', 'g'
  );
  tenant_slug := slug_base || '-' || substr(NEW.id::text, 1, 8);

  WHILE EXISTS (SELECT 1 FROM public.tenants WHERE slug = tenant_slug) LOOP
    slug_counter := slug_counter + 1;
    tenant_slug := slug_base || '-' || substr(NEW.id::text, 1, 8) || '-' || slug_counter;
  END LOOP;

  INSERT INTO public.tenants (name, slug, plan)
  VALUES (user_name || ' - Empresa', tenant_slug, 'trial')
  RETURNING id INTO new_tenant_id;

  INSERT INTO public.users (id, tenant_id, email, full_name, role)
  VALUES (NEW.id, new_tenant_id, NEW.email, user_name, 'owner');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
