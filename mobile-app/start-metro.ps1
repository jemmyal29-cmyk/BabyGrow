# Start Metro Bundler Script with TUNNEL (Universal Access)
Set-Location -Path "C:\BabyGrow\mobile-app"
Write-Host "Starting Expo Metro Bundler with TUNNEL mode..." -ForegroundColor Green
Write-Host "Location: $(Get-Location)" -ForegroundColor Cyan
Write-Host "This will work from ANY network!" -ForegroundColor Yellow
npx expo start --tunnel
