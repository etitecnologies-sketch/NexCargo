-- ===========================================
-- NEXCARGO — SCHEMA INICIAL DO BANCO DE DADOS
-- Migração 001 — Estrutura base multi-tenant
-- ===========================================

-- Habilita extensão para gerar IDs únicos (UUID)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Habilita extensão para criptografia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================
-- TABELA: tenants
-- Um "tenant" é cada empresa cliente do SaaS.
-- É como apartamentos num prédio — cada um tem seus próprios dados.
-- ===========================================
CREATE TABLE tenants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,      -- ex: "transportadora-abc" (usado na URL)
  plan        TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'starter', 'pro', 'enterprise')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  settings    JSONB NOT NULL DEFAULT '{}', -- configurações personalizadas de cada empresa
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- TABELA: users
-- Usuários do sistema (funcionários da transportadora)
-- ===========================================
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('owner', 'admin', 'operator', 'viewer')),
  is_active   BOOLEAN NOT NULL DEFAULT true,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, email)  -- mesmo email pode existir em tenants diferentes
);

-- ===========================================
-- TABELA: customers
-- Clientes que enviam/recebem encomendas
-- ===========================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  document      TEXT,                -- CPF ou CNPJ
  email         TEXT,
  phone         TEXT,                -- número do WhatsApp
  address       JSONB,               -- endereço completo em JSON
  is_active     BOOLEAN NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- TABELA: orders (PEDIDOS — coração do sistema)
-- Cada pedido é uma encomenda a ser entregue
-- ===========================================
CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tracking_code   TEXT NOT NULL,            -- código de rastreio (ex: NXC20240001SP)

  -- Quem envia e quem recebe
  sender_id       UUID REFERENCES customers(id),
  recipient_id    UUID REFERENCES customers(id),
  sender_name     TEXT NOT NULL,
  sender_phone    TEXT,
  recipient_name  TEXT NOT NULL,
  recipient_phone TEXT,                     -- WhatsApp para notificações

  -- Endereços
  origin_address    JSONB NOT NULL,         -- de onde sai
  destination_address JSONB NOT NULL,       -- para onde vai

  -- Dados da encomenda
  description     TEXT,
  weight_kg       DECIMAL(10,3),
  dimensions      JSONB,                   -- altura, largura, comprimento
  declared_value  DECIMAL(10,2),

  -- Valores financeiros
  freight_value   DECIMAL(10,2) NOT NULL DEFAULT 0,
  insurance_value DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_value     DECIMAL(10,2) NOT NULL DEFAULT 0,

  -- Status e datas
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- aguardando coleta
    'collected',    -- coletado
    'in_transit',   -- em trânsito
    'out_for_delivery', -- saiu para entrega
    'delivered',    -- entregue
    'failed',       -- falha na entrega
    'returned',     -- devolvido
    'cancelled'     -- cancelado
  )),

  -- SLA (prazo de entrega)
  estimated_delivery_date DATE,
  delivered_at    TIMESTAMPTZ,

  -- Quem criou o pedido
  created_by      UUID REFERENCES users(id),
  assigned_to     UUID REFERENCES users(id), -- entregador responsável

  -- Metadados
  notes           TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garante que o código de rastreio é único dentro de cada empresa
CREATE UNIQUE INDEX idx_orders_tracking ON orders(tenant_id, tracking_code);

-- ===========================================
-- TABELA: order_events (histórico de status)
-- Cada vez que um pedido muda de status, registra aqui
-- É como o "log" do pedido — mostra tudo que aconteceu
-- ===========================================
CREATE TABLE order_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  description TEXT NOT NULL,            -- ex: "Objeto coletado em São Paulo"
  location    TEXT,                     -- ex: "São Paulo - SP"
  latitude    DECIMAL(10,8),
  longitude   DECIMAL(11,8),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by  UUID REFERENCES users(id),
  metadata    JSONB NOT NULL DEFAULT '{}'
);

-- ===========================================
-- TABELA: labels (etiquetas geradas)
-- Cada pedido tem uma etiqueta com código de barras
-- ===========================================
CREATE TABLE labels (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  label_url     TEXT,                  -- URL do PDF gerado
  barcode       TEXT NOT NULL,         -- código de barras
  printed_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- TABELA: whatsapp_instances
-- Cada empresa conecta seu próprio WhatsApp
-- ===========================================
CREATE TABLE whatsapp_instances (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  instance_name TEXT NOT NULL,          -- nome interno na Evolution API
  phone_number  TEXT,                   -- número conectado
  status        TEXT NOT NULL DEFAULT 'disconnected' CHECK (status IN (
    'disconnected', 'connecting', 'connected', 'error'
  )),
  qr_code       TEXT,                   -- QR code para conectar
  connected_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id)
);

-- ===========================================
-- TABELA: whatsapp_messages (histórico de mensagens)
-- Guarda todas as mensagens enviadas/recebidas
-- ===========================================
CREATE TABLE whatsapp_messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES orders(id),
  direction       TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  phone_number    TEXT NOT NULL,
  message_type    TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'template')),
  content         TEXT NOT NULL,
  template_name   TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'read', 'failed'
  )),
  external_id     TEXT,                 -- ID da mensagem na Evolution API
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- TABELA: notifications_log
-- Registro de todas as notificações enviadas
-- ===========================================
CREATE TABLE notifications_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id),
  type        TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms', 'push')),
  trigger     TEXT NOT NULL,            -- ex: 'order_collected', 'out_for_delivery'
  recipient   TEXT NOT NULL,            -- telefone ou email
  status      TEXT NOT NULL DEFAULT 'pending',
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===========================================
-- INDEXES para performance
-- Como um índice de livro — agiliza as buscas mais comuns
-- ===========================================
CREATE INDEX idx_orders_tenant       ON orders(tenant_id);
CREATE INDEX idx_orders_status       ON orders(tenant_id, status);
CREATE INDEX idx_orders_created      ON orders(tenant_id, created_at DESC);
CREATE INDEX idx_order_events_order  ON order_events(order_id);
CREATE INDEX idx_customers_tenant    ON customers(tenant_id);
CREATE INDEX idx_customers_phone     ON customers(tenant_id, phone);
CREATE INDEX idx_whatsapp_messages   ON whatsapp_messages(tenant_id, created_at DESC);

-- ===========================================
-- FUNÇÃO: atualiza o campo updated_at automaticamente
-- Toda vez que qualquer registro for editado,
-- a data de atualização é preenchida sozinha
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplica a função em todas as tabelas que têm updated_at
CREATE TRIGGER trg_tenants_updated_at   BEFORE UPDATE ON tenants   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated_at     BEFORE UPDATE ON users     FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated_at    BEFORE UPDATE ON orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_whatsapp_updated_at  BEFORE UPDATE ON whatsapp_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at();
