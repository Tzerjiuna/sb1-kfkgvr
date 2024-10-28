#!/bin/bash

# Create directories
mkdir -p payment-gateway/{frontend,backend,db}

# Frontend files
cd payment-gateway/frontend
git init
git remote add origin https://github.com/yourusername/payment-gateway-frontend.git
git pull origin main

# Backend files
cd ../backend
git init
git remote add origin https://github.com/yourusername/payment-gateway-backend.git
git pull origin main

# Database files
cd ../db
wget https://raw.githubusercontent.com/yourusername/payment-gateway/main/db/schema.sql

# Copy configuration files
cp ../frontend/.env.example ../frontend/.env
cp ../backend/.env.example ../backend/.env

# Install dependencies
cd ../frontend
npm install

cd ../backend
composer install

# Set permissions
chmod +x ../frontend/deploy.sh
chmod -R 777 ../backend/storage

echo "Download completed! Project files are in the payment-gateway directory."