# BabyGrow - Start with Tunnel Mode
# Script untuk menjalankan aplikasi dengan tunnel mode
# Bisa diakses dari WiFi manapun!

Write-Host "🚀 Starting BabyGrow with Tunnel Mode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Keuntungan Tunnel Mode:" -ForegroundColor Green
Write-Host "  - Bisa diakses dari WiFi manapun" -ForegroundColor White
Write-Host "  - Bisa diakses dari data seluler" -ForegroundColor White
Write-Host "  - URL tidak berubah walau ganti WiFi" -ForegroundColor White
Write-Host ""

# Masuk ke folder mobile-app
Set-Location -Path "$PSScriptRoot\mobile-app"

# Start Expo dengan tunnel
npm start -- --tunnel
