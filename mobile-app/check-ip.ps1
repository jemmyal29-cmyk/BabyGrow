# Quick IP Check & Fix
# Gunakan jika tunnel mode tidak work

Write-Host "=" -NoNewline; 1..50 | ForEach-Object { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host "  BABYGROW - IP ADDRESS CHECKER" -ForegroundColor Cyan
Write-Host "=" -NoNewline; 1..50 | ForEach-Object { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host ""

# Get all IPv4 addresses
$ipAddresses = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.IPAddress -notlike "169.254.*"
} | Select-Object IPAddress, InterfaceAlias

Write-Host "Your PC IP Addresses:" -ForegroundColor Yellow
Write-Host ""

foreach ($ip in $ipAddresses) {
    Write-Host "  ✓ Network: $($ip.InterfaceAlias)" -ForegroundColor Green
    Write-Host "    IP: $($ip.IPAddress)" -ForegroundColor White
    Write-Host ""
}

Write-Host "=" -NoNewline; 1..50 | ForEach-Object { Write-Host "=" -NoNewline }; Write-Host ""
Write-Host ""

# Instructions
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Pastikan HP di WiFi yang SAMA dengan salah satu network di atas"
Write-Host "2. Catat IP address PC (misalnya: 192.168.1.100)"
Write-Host "3. Start Metro dengan LAN mode:"
Write-Host ""
Write-Host "   cd C:\BabyGrow\mobile-app" -ForegroundColor Cyan
Write-Host "   npx expo start" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Scan QR code yang muncul"
Write-Host "5. URL akan berupa: exp://<IP_ADDRESS>:8081"
Write-Host ""
Write-Host "=" -NoNewline; 1..50 | ForEach-Object { Write-Host "=" -NoNewline }; Write-Host ""

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
