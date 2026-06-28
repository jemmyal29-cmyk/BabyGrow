# ============================================
# BabyGrow - Build Production APK
# Standalone APK (tidak butuh Metro bundler)
# ============================================

Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   BabyGrow Production APK Builder    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "   Please run this script from mobile-app folder" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   cd C:\BabyGrow\mobile-app" -ForegroundColor Cyan
    Write-Host "   .\BUILD-PRODUCTION-APK.ps1" -ForegroundColor Cyan
    exit 1
}

Write-Host "📦 Building PRODUCTION APK..." -ForegroundColor Green
Write-Host "   This will create a STANDALONE APK" -ForegroundColor Yellow
Write-Host "   (No Metro bundler needed)" -ForegroundColor Yellow
Write-Host ""

# Set environment variable to bypass git check
$env:EAS_NO_VCS = "1"

Write-Host "🚀 Starting EAS Build..." -ForegroundColor Cyan
Write-Host ""

# Build production APK
eas build --profile production --platform android --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║   ✅ Production APK Build SUCCESS!    ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Production APK Features:" -ForegroundColor Cyan
    Write-Host "   ✓ Standalone (tidak butuh laptop)" -ForegroundColor Green
    Write-Host "   ✓ Tidak butuh Metro bundler" -ForegroundColor Green
    Write-Host "   ✓ Bisa langsung install & pakai" -ForegroundColor Green
    Write-Host "   ✓ BLE support included" -ForegroundColor Green
    Write-Host ""
    Write-Host "📥 Download link akan muncul di output di atas" -ForegroundColor Yellow
    Write-Host "   Atau cek: https://expo.dev/accounts/tiozo/projects/babygrow-mobile/builds" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Build FAILED!" -ForegroundColor Red
    Write-Host "   Check error messages above" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
