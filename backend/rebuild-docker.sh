#!/bin/bash
# Quick script to rebuild Docker backend with latest code

echo "Stopping containers..."
docker-compose down

echo "Rebuilding backend image..."
docker-compose build --no-cache backend

echo "Starting containers..."
docker-compose up -d

echo "Checking logs..."
docker-compose logs -f backend






