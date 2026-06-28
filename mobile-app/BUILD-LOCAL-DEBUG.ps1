# ===========================================
# BabyGrow - Local Debug APK Builder
# ===========================================
# Alternative build method jika EAS gagal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BabyGrow - Local Debug APK Build    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (-Not (Test-Path "package.json")) {
    Write-Host "ERROR: Bukan di directory mobile-app!" -ForegroundColor Red
    Write-Host "Run dari: C:\BabyGrow\mobile-app" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1/6] Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "android/app/build") {
    Remove-Item -Recurse -Force "android/app/build" -ErrorAction SilentlyContinue
    Write-Host "  Cleaned android/app/build" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[2/6] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/6] Pre-building with Expo..." -ForegroundColor Yellow
npx expo prebuild --platform android --clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: expo prebuild failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/6] Setting up Android environment..." -ForegroundColor Yellow
$env:ANDROID_HOME = "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

Write-Host "  ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Gray
Write-Host "  JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Gray

Write-Host ""
Write-Host "[5/6] Building debug APK with Gradle..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes..." -ForegroundColor Gray
Write-Host ""

cd android
.\gradlew assembleDebug --stacktrace

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Gradle build failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Kemungkinan penyebab:" -ForegroundColor Yellow
    Write-Host "  1. Android SDK tidak terinstall" -ForegroundColor Gray
    Write-Host "  2. Java JDK tidak ditemukan" -ForegroundColor Gray
    Write-Host "  3. Gradle version incompatible" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solusi:" -ForegroundColor Yellow
    Write-Host "  1. Install Android Studio dari:" -ForegroundColor Gray
    Write-Host "     https://developer.android.com/studio" -ForegroundColor Gray
    Write-Host "  2. Atau gunakan EAS build cloud (recommended)" -ForegroundColor Gray
    Write-Host ""
    cd ..
    exit 1
}

cd ..

Write-Host ""
Write-Host "[6/6] Locating APK file..." -ForegroundColor Yellow

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK Location:" -ForegroundColor Cyan
    Write-Host "  $apkPath" -ForegroundColor White
    Write-Host ""
    Write-Host "APK Size: $($apkSize.ToString('0.00')) MB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CARA INSTALL DI HP ANDROID" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Copy file APK ke HP:" -ForegroundColor Yellow
    Write-Host "   - Via USB cable" -ForegroundColor Gray
    Write-Host "   - Atau upload ke Google Drive/Dropbox" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Di HP, buka Settings:" -ForegroundColor Yellow
    Write-Host "   - Security -> Unknown Sources -> Enable" -ForegroundColor Gray
    Write-Host "   - Atau izinkan install dari file manager" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Tap file APK untuk install" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Buka app 'BabyGrow'" -ForegroundColor Yellow
    Write-Host "   - BUKAN Expo Go!" -ForegroundColor Red
    Write-Host "   - Icon harus BabyGrow pink" -ForegroundColor Gray
    Write-Host ""
    Write-Host "5. Test BLE connection:" -ForegroundColor Yellow
    Write-Host "   - Pastikan ESP32 running (Serial Monitor)" -ForegroundColor Gray
    Write-Host "   - Ukur Otomatis -> Pair dengan Alat" -ForegroundColor Gray
    Write-Host "   - 'BabyGrow_Alat' harus muncul!" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "ERROR: APK file not found!" -ForegroundColor Red
    Write-Host "Expected: $apkPath" -ForegroundColor Gray
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
