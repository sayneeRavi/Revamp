#!/bin/bash
# Quick start script for employee service
# MongoDB configuration is read from application.properties

echo "=========================================="
echo "Employee Service Startup Script"
echo "=========================================="
echo ""
echo "Starting employee service..."
echo "MongoDB connection configured in application.properties"
echo "=========================================="
echo ""

# Start the service
./mvnw spring-boot:run

