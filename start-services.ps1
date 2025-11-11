# Start all services for Revamp ERP System
# Run each in a separate terminal window

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Revamp ERP - Service Startup Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Please open 4 separate terminal windows and run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. GATEWAY (Port 4000):" -ForegroundColor Green
Write-Host "   cd gateway" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "2. AUTH SERVICE (Port 8081):" -ForegroundColor Green
Write-Host "   cd services/authservice" -ForegroundColor White
Write-Host "   mvn spring-boot:run" -ForegroundColor White
Write-Host ""
Write-Host "3. BOOKING SERVICE (Port 8080):" -ForegroundColor Green
Write-Host "   cd services/bookingservice" -ForegroundColor White
Write-Host "   mvn spring-boot:run" -ForegroundColor White
Write-Host ""
Write-Host "4. FRONTEND (Port 3000):" -ForegroundColor Green
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Make sure MongoDB Atlas is accessible!" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

