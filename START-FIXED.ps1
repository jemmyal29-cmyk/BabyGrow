# START SERVER - BabyGrow
# Fixed: Carousel button-based navigation + Login credentials corrected

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  🚀 BABYGROW SERVER STARTER" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Kill existing processes
Write-Host "🔄 Stopping existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to mobile-app
Set-Location "C:\BabyGrow\mobile-app"
Write-Host "📁 Location: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Display credentials
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  🔑 LOGIN CREDENTIALS" -ForegroundColor Magenta  
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "User:" -ForegroundColor Green
Write-Host "  📧 user@babygrow.app" -ForegroundColor White
Write-Host "  🔒 user123" -ForegroundColor White
Write-Host ""
Write-Host "Admin:" -ForegroundColor Green
Write-Host "  📧 admin@babygrow.app" -ForegroundColor White
Write-Host "  🔒 admin123" -ForegroundColor White
Write-Host ""
Write-Host "Super User:" -ForegroundColor Green
Write-Host "  📧 superuser@babygrow.app" -ForegroundColor White
Write-Host "  🔒 super123" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Fixes applied
Write-Host "✅ FIXES APPLIED:" -ForegroundColor Green
Write-Host "  1. Carousel: Button navigation (Lanjut/Kembali)" -ForegroundColor White
Write-Host "  2. Login: Correct credentials (user/admin/super)" -ForegroundColor White
Write-Host "  3. Logo: Using logo-babygrow.png image" -ForegroundColor White
Write-Host ""

# Start server
Write-Host "🚀 Starting Expo server..." -ForegroundColor Magenta
Write-Host ""

npx expo start --port 8082
