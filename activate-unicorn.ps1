# 🦄 ACTIVATE UNICORN 2026 SYSTEM
# Quick activation script for BabyGrow Unicorn 2026

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     🦄 UNICORN 2026 - ACTIVATION SCRIPT 🦄         ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Step 1: Backup existing App.tsx
Write-Host "[1/4] 📦 Backing up existing App.tsx..." -ForegroundColor Cyan
if (Test-Path "mobile-app\App.tsx") {
    Copy-Item "mobile-app\App.tsx" "mobile-app\App-OLD-Backup.tsx" -Force
    Write-Host "✅ Backup created: App-OLD-Backup.tsx" -ForegroundColor Green
} else {
    Write-Host "⚠️  App.tsx not found, skipping backup" -ForegroundColor Yellow
}

# Step 2: Activate Unicorn App.tsx
Write-Host ""
Write-Host "[2/4] 🚀 Activating Unicorn system..." -ForegroundColor Cyan
if (Test-Path "mobile-app\App-Unicorn.tsx") {
    Copy-Item "mobile-app\App-Unicorn.tsx" "mobile-app\App.tsx" -Force
    Write-Host "✅ Unicorn system activated!" -ForegroundColor Green
} else {
    Write-Host "❌ App-Unicorn.tsx not found!" -ForegroundColor Red
    Write-Host "   Please ensure all Unicorn files are created first." -ForegroundColor Yellow
    exit 1
}

# Step 3: Verify required files
Write-Host ""
Write-Host "[3/4] 🔍 Verifying Unicorn files..." -ForegroundColor Cyan

$requiredFiles = @(
    "mobile-app\src\navigation\AppNavigatorUnicorn.tsx",
    "mobile-app\src\screens\OnboardingScreenUnicorn.tsx",
    "mobile-app\src\screens\LoginScreenUnicorn3D.tsx",
    "mobile-app\src\services\BLEServiceUnicorn.ts",
    "mobile-app\src\components\common\PairingPopup3D.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file NOT FOUND" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "⚠️  Some required files are missing!" -ForegroundColor Yellow
    Write-Host "   Please create all Unicorn files first." -ForegroundColor Yellow
    exit 1
}

# Step 4: Check logo file
Write-Host ""
Write-Host "[4/4] 🖼️  Checking logo file..." -ForegroundColor Cyan
if (Test-Path "mobile-app\assets\images\logo-babygrow.png") {
    Write-Host "✅ Logo file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Logo file not found at assets/images/logo-babygrow.png" -ForegroundColor Yellow
    Write-Host "   App will work but logo won't display" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ UNICORN 2026 ACTIVATED! ✅              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Clear AsyncStorage on device (first run)" -ForegroundColor White
Write-Host "   2. Run: cd mobile-app && npm start" -ForegroundColor White
Write-Host "   3. Open Expo Go and scan QR code" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To revert to old system:" -ForegroundColor Cyan
Write-Host "   Copy-Item mobile-app\App-OLD-Backup.tsx mobile-app\App.tsx -Force" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full documentation: UNICORN-INTEGRATION-GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🦄 Happy coding with Unicorn 2026! 🦄" -ForegroundColor Magenta
Write-Host ""
