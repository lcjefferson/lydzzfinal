#!/bin/bash

# Deploy script for VPS
# Usage: ./deploy_to_vps.sh [user@host] [remote_dir]

REMOTE="${1:-root@72.60.154.65}"
REMOTE_DIR="${2:-/root/lydzz/lydzzfinal}"

# Split user and host
if [[ "$REMOTE" == *"@"* ]]; then
    USER_HOST="$REMOTE"
else
    USER_HOST="root@$REMOTE"
fi

echo "🚀 Starting deployment to $USER_HOST:$REMOTE_DIR..."

# Ensure remote directory exists
echo "📁 Checking remote directory..."
ssh "$USER_HOST" "mkdir -p $REMOTE_DIR"

# Sync files
echo "🔄 Syncing files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.env' \
    --exclude 'postgres_data' \
    --exclude 'redis_data' \
    --exclude 'uploads_data' \
    ./ "$USER_HOST:$REMOTE_DIR/"

# Run deploy script remotely
echo "🏗️ Running remote deploy script..."
# Use -t to force pseudo-terminal allocation for interactive scripts (like setup_secure_env.sh)
ssh -t "$USER_HOST" "cd $REMOTE_DIR && chmod +x deploy.sh setup_secure_env.sh && ./deploy.sh"

echo "✅ Deployment finished!"
