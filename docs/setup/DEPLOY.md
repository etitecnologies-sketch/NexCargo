# Deploy em Produção — NexCargo

## Requisitos do servidor (VPS Contabo)

- Ubuntu 22.04 LTS
- Mínimo 4 vCPU / 8 GB RAM / 100 GB SSD
- Docker + Docker Compose instalados
- Domínio apontando para o IP do servidor

## Passo a Passo

### 1. Conecte ao servidor via SSH

```bash
ssh root@IP_DO_SERVIDOR
```

### 2. Instale Docker

```bash
curl -fsSL https://get.docker.com | bash
```

### 3. Clone o repositório

```bash
git clone https://github.com/sua-org/nexcargo.git /opt/nexcargo
cd /opt/nexcargo
```

### 4. Configure as variáveis de ambiente

```bash
cp .env.production.example .env
nano .env   # preencha todos os valores
```

### 5. Configure o DNS

No painel do seu domínio, crie 3 registros tipo A:

| Subdomínio                      | IP              |
|---------------------------------|-----------------|
| app.nexcargo.com.br             | IP_DO_SERVIDOR  |
| n8n.nexcargo.com.br             | IP_DO_SERVIDOR  |
| evolution.nexcargo.com.br       | IP_DO_SERVIDOR  |

Aguarde a propagação (pode levar até 1 hora).

### 6. Obtenha certificado SSL

```bash
docker compose -f infra/docker/docker-compose.prod.yml run certbot
```

### 7. Faça o deploy

```bash
bash infra/scripts/deploy.sh
```

### 8. Configure o N8N

1. Acesse https://n8n.nexcargo.com.br
2. Importe os workflows de `n8n/workflows/`
3. Configure as credenciais (Postgres + Evolution API)
4. Ative os workflows

---

## Usando Coolify (alternativa mais simples)

O Coolify é como um painel de controle que gerencia tudo isso visualmente.

1. Instale o Coolify: `curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash`
2. Acesse `http://IP_SERVIDOR:8000`
3. Crie um novo projeto e aponte para o repositório Git
4. Cole o conteúdo do `docker-compose.prod.yml`
5. Preencha as variáveis de ambiente na interface visual
6. Clique em "Deploy"

O Coolify gerencia SSL, reinicializações e atualizações automáticas.

---

## Atualizar após mudanças no código

```bash
cd /opt/nexcargo
git pull
bash infra/scripts/deploy.sh
```

---

## Monitoramento

```bash
# Ver logs em tempo real
docker compose -f infra/docker/docker-compose.prod.yml logs -f web

# Ver status dos containers
docker compose -f infra/docker/docker-compose.prod.yml ps

# Reiniciar só o frontend
docker compose -f infra/docker/docker-compose.prod.yml restart web
```
