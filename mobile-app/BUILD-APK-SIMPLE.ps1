# ========================================
# BabyGrow - Simple APK Builder
# ========================================
# Script sederhana untuk build APK

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BabyGrow - Simple APK Builder       " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check directory
if (-not (Test-Path ".\package.json")) {
    Write-Host "ERROR: Run this in mobile-app folder!" -ForegroundColor Red
    Write-Host "   cd C:\BabyGrow\mobile-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "Step 1: Checking environment..." -ForegroundColor Cyan

# Check if logged in
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Logging in..." -ForegroundColor Yellow
    eas login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Logged in successfully!" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Starting build..." -ForegroundColor Cyan
Write-Host "This will take ~20 minutes" -ForegroundColor Gray
Write-Host ""

# Set environment and build
$env:EAS_NO_VCS = "1"
eas build --profile development --platform android --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   BUILD SUCCESS!                      " -ForegroundColor Green  
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Download APK from the link above" -ForegroundColor White
    Write-Host "2. Transfer to your Android phone" -ForegroundColor White
    Write-Host "3. Install APK" -ForegroundColor White
    Write-Host "4. Open app -> Ukur Otomatis -> Pair" -ForegroundColor White
    Write-Host "5. Connect to BabyGrow_Alat!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Use Expo Go for testing (mock mode)" -ForegroundColor Yellow
    Write-Host "Run: npm start" -ForegroundColor Cyan
    Write-Host "Scan QR code with Expo Go app" -ForegroundColor Cyan
}
