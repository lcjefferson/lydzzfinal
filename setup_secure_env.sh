#!/bin/bash

# Script para gerar credenciais seguras e configurar o ambiente

echo "🔒 Configurando ambiente seguro..."

if [ -f .env ]; then
    read -p "Arquivo .env já existe. Deseja sobrescrever? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

# Copiar exemplo
cp .env.example .env

# Funções geradoras
generate_password() {
    openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 24
}

generate_key() {
    openssl rand -hex 32
}

# Gerar segredos
DB_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_key)
JWT_REFRESH=$(generate_key)
ENC_KEY=$(openssl rand -hex 16) # 32 chars

# Substituir no arquivo .env
# Nota: Usamos perl ou sed compatível com Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    SED_CMD="sed -i ''"
else
    SED_CMD="sed -i"
fi

echo "Gerando senhas fortes..."

# Database
$SED_CMD "s/POSTGRES_PASSWORD=secure_password_here/POSTGRES_PASSWORD=$DB_PASSWORD/" .env

# JWT
$SED_CMD "s/JWT_SECRET=your_jwt_secret_key_at_least_32_chars/JWT_SECRET=$JWT_SECRET/" .env
$SED_CMD "s/JWT_REFRESH_SECRET=your_refresh_secret_key_at_least_32_chars/JWT_REFRESH_SECRET=$JWT_REFRESH/" .env

# Encryption
$SED_CMD "s/ENCRYPTION_KEY=your_32_char_encryption_key_here!!!!/ENCRYPTION_KEY=$ENC_KEY/" .env

echo "🌍 Configuração de Rede"
read -p "Digite o IP Público ou Domínio da sua VPS (ex: 123.45.67.89): " VPS_IP

if [ -z "$VPS_IP" ]; then
    echo "⚠️  Nenhum IP fornecido. Mantendo configuração padrão (pode não funcionar externamente)."
else
    # Remove http/https se o usuário digitou
    VPS_IP=${VPS_IP#http://}
    VPS_IP=${VPS_IP#https://}
    # Remove barras no final
    VPS_IP=${VPS_IP%/}

    echo "Configurando IP: $VPS_IP"
    
    # Atualiza URLs no .env
    $SED_CMD "s|NEXT_PUBLIC_API_URL=http://your-vps-ip:3000|NEXT_PUBLIC_API_URL=http://$VPS_IP:3000|" .env
    $SED_CMD "s|NEXT_PUBLIC_WS_URL=http://your-vps-ip:3000|NEXT_PUBLIC_WS_URL=http://$VPS_IP:3000|" .env
    $SED_CMD "s|APP_URL=http://your-vps-ip:3000|APP_URL=http://$VPS_IP:3000|" .env
    $SED_CMD "s|FRONTEND_URL=http://your-vps-ip:3001|FRONTEND_URL=http://$VPS_IP:3001|" .env
fi

echo "✅ Arquivo .env gerado com sucesso com senhas fortes!"
echo "⚠️  IMPORTANTE: Edite o arquivo .env e adicione suas chaves de API (OpenAI, WhatsApp, etc) antes de fazer o deploy."
echo "   nano .env"
