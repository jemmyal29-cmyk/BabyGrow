# ============================================
# 🚀 BABYGROW - START SERVER (FIXED)
# ============================================
# All errors fixed, ready to use!
# ============================================

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🍼 BABYGROW SERVER - STARTING" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
Set-Location "C:\BabyGrow\mobile-app"

# Kill existing processes
Write-Host "🔄 Stopping existing Metro Bundler..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ ALL FIXES APPLIED:" -ForegroundColor White
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "  1. Logo: Using logo-babygrow.png" -ForegroundColor White
Write-Host "  2. Login: user@babygrow.app/user123" -ForegroundColor White
Write-Host "  3. Import errors: Fixed all paths" -ForegroundColor White
Write-Host "  4. BLEService typo: Fixed" -ForegroundColor White
Write-Host "  5. Carousel: Button navigation ready" -ForegroundColor White
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🔑 LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  👤 User:" -ForegroundColor Green
Write-Host "     Email   : user@babygrow.app" -ForegroundColor White
Write-Host "     Password: user123" -ForegroundColor White
Write-Host ""
Write-Host "  👨‍💼 Admin:" -ForegroundColor Green
Write-Host "     Email   : admin@babygrow.app" -ForegroundColor White
Write-Host "     Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "  🔐 Super User:" -ForegroundColor Green
Write-Host "     Email   : superuser@babygrow.app" -ForegroundColor White
Write-Host "     Password: super123" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🚀 Starting Expo Server..." -ForegroundColor Magenta
Write-Host "   Mode: TUNNEL (Better connectivity)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📱 Scan QR code dengan Expo Go di HP Anda" -ForegroundColor Green
Write-Host ""

# Start server with tunnel mode
npx expo start --port 8082 --tunnel
