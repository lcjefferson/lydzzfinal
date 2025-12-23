#!/bin/bash

echo "==================================================="
echo "MONITORAMENTO DE LOGS EM TEMPO REAL"
echo "==================================================="
echo "Pressione Ctrl+C para sair."
echo ""
echo "Exibindo logs dos containers (Backend, Frontend, Postgres)..."

docker compose -f docker-compose.prod.yml logs -f --tail=50
