# ========================================
# BabyGrow - Start Server with QR Code
# ========================================
# Start development server and show QR code

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BabyGrow Development Server          " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check directory
if (-not (Test-Path ".\package.json")) {
    Write-Host "ERROR: Run this in mobile-app folder!" -ForegroundColor Red
    Write-Host "   cd C:\BabyGrow\mobile-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Expo development server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "- Expo Go = MOCK MODE (fake data)" -ForegroundColor Gray
Write-Host "- Custom APK = REAL BLE (connect to ESP32)" -ForegroundColor Gray
Write-Host ""
Write-Host "For real BLE, you need to build custom APK!" -ForegroundColor Yellow
Write-Host "Run: .\BUILD-APK-SIMPLE.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start server
npm start
