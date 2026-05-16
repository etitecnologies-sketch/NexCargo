#!/bin/bash
# ===========================================
# NexCargo — Script de Deploy em Produção
# Execute no servidor: bash deploy.sh
# ===========================================

set -e  # Para tudo se qualquer comando falhar

echo "🚀 Iniciando deploy do NexCargo..."

# Verifica se o .env existe
if [ ! -f ".env" ]; then
  echo "❌ Arquivo .env não encontrado. Copie .env.example e preencha."
  exit 1
fi

# Puxa as últimas imagens
echo "📦 Baixando imagens Docker..."
docker compose -f infra/docker/docker-compose.prod.yml pull

# Para os containers sem derrubar volumes
echo "⏹️  Parando containers..."
docker compose -f infra/docker/docker-compose.prod.yml down --remove-orphans

# Sobe tudo novamente
echo "▶️  Subindo containers..."
docker compose -f infra/docker/docker-compose.prod.yml up -d

# Aguarda o web ficar saudável
echo "⏳ Aguardando aplicação ficar pronta..."
timeout 60 bash -c 'until curl -sf http://localhost:3000/api/health; do sleep 2; done'

echo ""
echo "✅ Deploy concluído com sucesso!"
echo "   App:       https://app.nexcargo.com.br"
echo "   N8N:       https://n8n.nexcargo.com.br"
echo "   Evolution: https://evolution.nexcargo.com.br"
echo ""

# Limpa imagens antigas (economiza espaço em disco)
docker image prune -f

echo "🧹 Limpeza concluída."
