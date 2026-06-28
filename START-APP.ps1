# ====================================
# BabyGrow - Quick Start Script
# ====================================

Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host "=" -NoNewline -ForegroundColor Magenta  
Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host " BabyGrow App " -NoNewline -ForegroundColor White
Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host "=" -NoNewline -ForegroundColor Magenta
Write-Host "=" -ForegroundColor Magenta
Write-Host ""

Write-Host "📱 Pilih Mode Koneksi:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. LAN Mode (WiFi Sama) - Cepat ⚡" -ForegroundColor Green
Write-Host "   HP dan PC harus di WiFi yang sama" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Tunnel Mode (WiFi Beda) - Internet 🌐" -ForegroundColor Yellow
Write-Host "   Bisa diakses dari WiFi/Data manapun" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Pilih mode (1 atau 2)"

Set-Location -Path "$PSScriptRoot\mobile-app"

if ($choice -eq "2") {
    Write-Host ""
    Write-Host "🌐 Starting with Tunnel Mode..." -ForegroundColor Yellow
    Write-Host "⏳ Tunggu 10-15 detik untuk tunnel ready..." -ForegroundColor Gray
    Write-Host ""
    npm start -- --tunnel
} else {
    Write-Host ""
    Write-Host "⚡ Starting with LAN Mode..." -ForegroundColor Green
    Write-Host "📡 Your PC IP: " -NoNewline -ForegroundColor Cyan
    
    # Get WiFi IP
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress
    if ($ip) {
        Write-Host $ip -ForegroundColor White
    } else {
        Write-Host "Checking..." -ForegroundColor Gray
    }
    Write-Host ""
    npm start
}
