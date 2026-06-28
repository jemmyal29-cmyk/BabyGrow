# BABYGROW SERVER START
# All fixes applied - ready to use

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BABYGROW SERVER - STARTING" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\BabyGrow\mobile-app"

Write-Host "Stopping existing server..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  FIXES APPLIED:" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host "  1. Logo: logo-babygrow.png" -ForegroundColor White
Write-Host "  2. Login fixed" -ForegroundColor White
Write-Host "  3. Import errors fixed" -ForegroundColor White
Write-Host "  4. BLEService typo fixed" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  User:" -ForegroundColor Green
Write-Host "    Email   : user@babygrow.app" -ForegroundColor White
Write-Host "    Password: user123" -ForegroundColor White
Write-Host ""
Write-Host "  Admin:" -ForegroundColor Green
Write-Host "    Email   : admin@babygrow.app" -ForegroundColor White
Write-Host "    Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "  Super User:" -ForegroundColor Green
Write-Host "    Email   : superuser@babygrow.app" -ForegroundColor White
Write-Host "    Password: super123" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Expo Server with TUNNEL mode..." -ForegroundColor Magenta
Write-Host "Mode: TUNNEL (Better connectivity)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Scan QR code dengan Expo Go" -ForegroundColor Green
Write-Host ""

npx expo start --port 8082 --tunnel
