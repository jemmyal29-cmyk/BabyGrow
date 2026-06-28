# BabyGrow - Build APK Script
# Automated APK building with EAS Build

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "       BABYGROW APK BUILDER                  " -ForegroundColor Green
Write-Host "===============================================`n" -ForegroundColor Cyan

# Navigate to project
Set-Location $PSScriptRoot

# Set environment
$env:EAS_NO_VCS = '1'

Write-Host "Checking configuration..." -ForegroundColor Yellow

# Check if eas.json exists
if (-not (Test-Path "eas.json")) {
    Write-Host "ERROR: eas.json not found! Run configuration first." -ForegroundColor Red
    exit 1
}

Write-Host "Configuration OK`n" -ForegroundColor Green

Write-Host "Starting APK Build...`n" -ForegroundColor Yellow
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  Platform: Android" -ForegroundColor White
Write-Host "  Type: APK (installable)" -ForegroundColor White  
Write-Host "  Profile: preview" -ForegroundColor White
Write-Host "  Build Location: Expo Cloud`n" -ForegroundColor White

Write-Host "Estimated time: 5-10 minutes`n" -ForegroundColor Yellow

# Start build
Write-Host "Starting build process..." -ForegroundColor Green
eas build --platform android --profile preview

Write-Host "`nBuild command completed!" -ForegroundColor Green
Write-Host "Check the link above to monitor build progress.`n" -ForegroundColor Yellow
