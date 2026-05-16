# Como rodar o NexCargo localmente

## Pré-requisitos (instale antes)

1. **Node.js 20+** → https://nodejs.org
2. **Docker Desktop** → https://www.docker.com/products/docker-desktop
3. **Git** → https://git-scm.com

---

## Passo a passo

### 1. Configure as variáveis de ambiente

```bash
# Na pasta raiz do projeto, copie o arquivo de exemplo:
cp .env.example .env

# Depois abra o .env e preencha as chaves do Supabase
```

### 2. Suba os serviços com Docker

```bash
npm run docker:up
```

Isso vai iniciar:
- PostgreSQL (banco de dados) → porta 5432
- Redis (filas) → porta 6379
- N8N (automações) → http://localhost:5678
- Evolution API (WhatsApp) → http://localhost:8080

### 3. Instale as dependências

```bash
npm install
```

### 4. Rode as migrações do banco

```bash
npm run db:migrate
```

### 5. Inicie o frontend

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## URLs dos serviços

| Serviço      | URL                       | Login          |
|--------------|---------------------------|----------------|
| Frontend     | http://localhost:3000     | —              |
| N8N          | http://localhost:5678     | admin / (seu .env) |
| Evolution    | http://localhost:8080     | apikey do .env |
| Supabase     | https://supabase.com      | conta própria  |

---

## Conectar WhatsApp

1. Acesse http://localhost:8080
2. Crie uma instância chamada `nexcargo-instance`
3. Escaneie o QR code com seu WhatsApp
4. Pronto! Mensagens automáticas funcionando.

---

## Configurar N8N

1. Acesse http://localhost:5678
2. Importe o workflow: `n8n/workflows/whatsapp_order_notifications.json`
3. Configure as credenciais:
   - Postgres: host=localhost, db=nexcargo, user=nexcargo, pass=nexcargo_dev_password
   - Evolution API: apikey do seu .env
4. Ative o workflow

---

## Parar os serviços

```bash
npm run docker:down
```
