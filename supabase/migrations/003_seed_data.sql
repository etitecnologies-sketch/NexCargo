-- ===========================================
-- NEXCARGO — DADOS INICIAIS DE TESTE
-- Migração 003 — Seed para desenvolvimento
-- ===========================================
-- Isso cria dados fictícios pra você testar
-- sem precisar cadastrar tudo na mão
-- ===========================================

-- Tenant de exemplo (empresa demo)
INSERT INTO tenants (id, name, slug, plan) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Transportadora Demo LTDA',
  'demo',
  'pro'
);

-- Usuário admin da empresa demo
INSERT INTO users (id, tenant_id, email, full_name, role) VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'admin@demo.nexcargo.com.br',
  'Admin Demo',
  'owner'
);

-- Clientes de exemplo
INSERT INTO customers (tenant_id, name, phone, email, address) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'João Silva',
  '5511999990001',
  'joao@exemplo.com',
  '{"street": "Rua das Flores, 100", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb
),
(
  '00000000-0000-0000-0000-000000000001',
  'Maria Souza',
  '5511999990002',
  'maria@exemplo.com',
  '{"street": "Av. Paulista, 1000", "city": "São Paulo", "state": "SP", "zip": "01310-200"}'::jsonb
);
