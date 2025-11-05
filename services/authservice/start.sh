#!/bin/bash
# Quick start script for auth service
# MongoDB configuration is read from application.properties

echo "=========================================="
echo "Auth Service Startup Script"
echo "=========================================="
echo ""
echo "Starting auth service..."
echo "MongoDB connection configured in application.properties"
echo "=========================================="
echo ""

# Start the service
./mvnw spring-boot:run

