#!/bin/bash

# Deploy Script for Lydzz App

echo "Starting deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    if [ -f setup_secure_env.sh ]; then
        chmod +x setup_secure_env.sh
        ./setup_secure_env.sh
        if [ $? -ne 0 ]; then
           echo "Error creating secure environment."
           exit 1
        fi
    elif [ -f .env.example ]; then
        cp .env.example .env
        echo "Please edit .env file with your production configuration."
        exit 1
    else
        echo "Error: .env.example not found. Please create .env file manually."
        exit 1
    fi
fi

# Build and start containers
echo "Building and starting containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
echo "Running database migrations..."
docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "Deployment completed successfully!"
echo "Backend running on port 3000"
echo "Frontend running on port 3001"
