# BabyGrow - Start Expo and Display QR Code
# Usage: .\start-expo-qr.ps1

Write-Host "🚀 Starting BabyGrow Expo Server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile-app directory
Set-Location "C:\BabyGrow\mobile-app"

# Verify we're in the right place
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found!" -ForegroundColor Red
    Write-Host "Current location: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Found package.json" -ForegroundColor Green
Write-Host "✓ Starting Metro Bundler..." -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  QR CODE akan muncul di bawah ini" -ForegroundColor Cyan
Write-Host "  Scan dengan Expo Go app di HP Anda" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Start Expo
npm start
