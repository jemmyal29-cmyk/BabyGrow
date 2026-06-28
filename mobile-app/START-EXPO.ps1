# BabyGrow - Start Expo Metro Bundler
# Quick start script untuk development

Write-Host "Starting BabyGrow Metro Bundler..." -ForegroundColor Magenta
Write-Host ""

# Navigate to correct directory
Set-Location $PSScriptRoot

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start Expo (standard mode - more stable)
Write-Host "Starting Expo Metro Bundler..." -ForegroundColor Green
Write-Host "Make sure your phone and PC are on the same WiFi!" -ForegroundColor Yellow
Write-Host ""

npx expo start
