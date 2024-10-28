#!/bin/bash

# Stop and remove existing containers
docker-compose down

# Build and start containers
docker-compose up -d --build

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 30

# Initialize database
docker-compose exec db mysql -uroot -proot_password payment_gateway < ./check/schema.sql

echo "Deployment completed! Services are available at:"
echo "Frontend: http://localhost:8080"
echo "Backend API: http://localhost:9001"
echo "MySQL: localhost:3307"