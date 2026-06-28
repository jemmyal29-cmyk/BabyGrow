# 🚀 START BABYGROW APP - Quick Testing Script
# Tanggal: 25 Januari 2026

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║           🍼 BABYGROW UNICORN 2026 🦄                      ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║         Semua Masalah Sudah Diperbaiki! ✅                 ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 3 MASALAH YANG SUDAH DIPERBAIKI:" -ForegroundColor Green
Write-Host "   ✅ 1. Carousel onboarding (5 slides HD professional)" -ForegroundColor White
Write-Host "   ✅ 2. Logo di login page (circular + AI badge)" -ForegroundColor White
Write-Host "   ✅ 3. Login functionality (navigate ke UserTabs)" -ForegroundColor White
Write-Host ""

Write-Host "🎯 TEST CREDENTIALS:" -ForegroundColor Yellow
Write-Host "   Parent: user@babygrow.app / user123" -ForegroundColor White
Write-Host "   Admin:  admin@babygrow.app / admin123" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Starting Expo development server..." -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile-app directory
Set-Location -Path "C:\BabyGrow\mobile-app"

# Check if package.json exists
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json tidak ditemukan!" -ForegroundColor Red
    Write-Host "   Pastikan Anda di folder: C:\BabyGrow\mobile-app" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules tidak ditemukan. Menjalankan npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install gagal!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Environment ready!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📱 CARA TESTING:" -ForegroundColor Yellow
Write-Host "   1. Buka Expo Go di HP Android" -ForegroundColor White
Write-Host "   2. Scan QR code yang muncul" -ForegroundColor White
Write-Host "   3. Tunggu app loading (~10-30 detik)" -ForegroundColor White
Write-Host "   4. Lihat onboarding carousel (5 slides)" -ForegroundColor White
Write-Host "   5. Tap 'Quick Login - User' atau 'Quick Login - Admin'" -ForegroundColor White
Write-Host "   6. Verifikasi navigate ke UserTabs (4 tabs di bottom)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "   • Onboarding tidak muncul? → Uninstall + reinstall app" -ForegroundColor White
Write-Host "   • Login gagal? → Tap tombol 'Quick Login'" -ForegroundColor White
Write-Host "   • QR tidak bisa discan? → Tekan 't' untuk tunnel mode" -ForegroundColor White
Write-Host "   • App crash? → Tekan 'r' untuk reload" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Magenta
Write-Host "   → FIX-COMPLETE-TESTING.md     (Testing guide)" -ForegroundColor White
Write-Host "   → FIX-SUMMARY-COMPLETE.md     (Complete summary)" -ForegroundColor White
Write-Host "   → QUICK-LOGIN-GUIDE.ts        (Login credentials)" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Starting server di port 8082..." -ForegroundColor Cyan
Write-Host ""

# Start Expo server
npx expo start --port 8082

# If server exits
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Write-Host ""
