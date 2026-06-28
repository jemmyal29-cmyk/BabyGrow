# ========================================
# BabyGrow - Build Custom Development APK
# ========================================
# Script ini akan build APK dengan real BLE support
# Expo Go TIDAK bisa BLE, butuh custom build!

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BabyGrow Custom APK Builder         " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-not (Test-Path ".\package.json")) {
    Write-Host "ERROR: Harus dijalankan di folder mobile-app!" -ForegroundColor Red
    Write-Host "   cd C:\BabyGrow\mobile-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "Pilih Metode Build:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. EAS Build (Cloud) - RECOMMENDED" -ForegroundColor Green
Write-Host "   - Tidak perlu Android Studio"
Write-Host "   - Build di cloud (free untuk development)"
Write-Host "   - Download APK setelah selesai (~20 menit)"
Write-Host "   - Butuh akun Expo (gratis)"
Write-Host ""
Write-Host "2. Local Build" -ForegroundColor Cyan
Write-Host "   - Butuh Android Studio + SDK"
Write-Host "   - Build di laptop (lama, butuh space besar)"
Write-Host "   - Install langsung via USB"
Write-Host ""

$choice = Read-Host "Pilih (1/2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   EAS Build - Cloud Build Service     " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""

    # Check if eas-cli installed
    Write-Host "Checking EAS CLI..." -ForegroundColor Cyan
    $easInstalled = Get-Command eas -ErrorAction SilentlyContinue
    
    if (-not $easInstalled) {
        Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
        npm install -g eas-cli
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Gagal install EAS CLI!" -ForegroundColor Red
            exit 1
        }
        Write-Host "EAS CLI installed!" -ForegroundColor Green
    } else {
        Write-Host "EAS CLI sudah terinstall" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Login ke Expo Account..." -ForegroundColor Cyan
    Write-Host "   (Jika belum punya, buat di https://expo.dev/signup)" -ForegroundColor Gray
    Write-Host ""
    
    eas login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Login gagal! Coba lagi atau buat account baru" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Login berhasil!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Konfigurasi EAS Build..." -ForegroundColor Cyan
    
    # Check if eas.json exists
    if (-not (Test-Path ".\eas.json")) {
        Write-Host "Creating eas.json..." -ForegroundColor Yellow
        eas build:configure
    } else {
        Write-Host "eas.json sudah ada" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "   BUILDING DEVELOPMENT APK...          " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Proses ini akan memakan waktu ~20-30 menit" -ForegroundColor Gray
    Write-Host "APK akan didownload otomatis setelah selesai" -ForegroundColor Gray
    Write-Host ""
    
    # Start build
    eas build --profile development --platform android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   BUILD SUCCESS!                       " -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Download APK dari link di atas" -ForegroundColor Cyan
        Write-Host "Transfer ke HP Android" -ForegroundColor Cyan
        Write-Host "Install APK" -ForegroundColor Cyan
        Write-Host "Buka app -> Ukur Otomatis -> Pair dengan Alat" -ForegroundColor Cyan
        Write-Host "Sekarang bisa detect BabyGrow_Alat!" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Build gagal!" -ForegroundColor Red
        Write-Host "Cek error message di atas" -ForegroundColor Yellow
        Write-Host "Coba: eas build --profile development --platform android --clear-cache" -ForegroundColor Gray
    }

} elseif ($choice -eq "2") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   Local Build - Android Studio         " -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "WARNING: Metode ini butuh:" -ForegroundColor Yellow
    Write-Host "   - Android Studio installed" -ForegroundColor Gray
    Write-Host "   - Android SDK + Tools" -ForegroundColor Gray
    Write-Host "   - ~10GB disk space" -ForegroundColor Gray
    Write-Host "   - HP connected via USB (USB Debugging ON)" -ForegroundColor Gray
    Write-Host ""
    
    $confirm = Read-Host "Lanjutkan? (y/n)"
    
    if ($confirm -ne "y") {
        Write-Host "Dibatalkan. Gunakan EAS Build saja." -ForegroundColor Yellow
        exit 0
    }

    Write-Host ""
    Write-Host "Step 1: Prebuild (Generate native code)..." -ForegroundColor Cyan
    npx expo prebuild --clean
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Prebuild gagal!" -ForegroundColor Red
        exit 1
    }

    Write-Host ""
    Write-Host "Step 2: Build & Install APK..." -ForegroundColor Cyan
    Write-Host "   (Ini akan lama, ~15-30 menit)" -ForegroundColor Gray
    npx expo run:android
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Build & install berhasil!" -ForegroundColor Green
        Write-Host "App sudah terinstall di HP via USB" -ForegroundColor Cyan
        Write-Host "Buka app -> Ukur Otomatis -> Pair dengan Alat" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Build gagal!" -ForegroundColor Red
        Write-Host "Pastikan:" -ForegroundColor Yellow
        Write-Host "   - Android Studio installed" -ForegroundColor Gray
        Write-Host "   - ANDROID_HOME env variable set" -ForegroundColor Gray
        Write-Host "   - HP connected via USB" -ForegroundColor Gray
        Write-Host "   - USB Debugging enabled" -ForegroundColor Gray
    }

} else {
    Write-Host "Pilihan tidak valid!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build script selesai!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
