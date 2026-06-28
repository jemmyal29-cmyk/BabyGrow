# Script untuk Copy Logo BabyGrow
# Jalankan: .\copy-logo.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  BabyGrow Logo Setup Script" -ForegroundColor Magenta
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$logoPath = "$PSScriptRoot\mobile-app\assets\babygrow-logo.png"

# Cek apakah logo sudah ada
if (Test-Path $logoPath) {
    Write-Host "✅ Logo sudah ada di:" -ForegroundColor Green
    Write-Host "   $logoPath" -ForegroundColor Yellow
    Write-Host ""
    
    # Tampilkan info file
    $file = Get-Item $logoPath
    Write-Host "📊 Info Logo:" -ForegroundColor Cyan
    Write-Host "   Ukuran: $([math]::Round($file.Length/1KB, 2)) KB" -ForegroundColor White
    Write-Host "   Tanggal: $($file.LastWriteTime)" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✨ Logo siap digunakan!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
    Write-Host "1. Buka file: mobile-app\src\screens\LoginScreen.tsx" -ForegroundColor White
    Write-Host "2. Uncomment baris Image component (hapus komentar)" -ForegroundColor White
    Write-Host "3. Comment baris emoji placeholder" -ForegroundColor White
    Write-Host "4. Jalankan: cd mobile-app; npm start" -ForegroundColor White
} else {
    Write-Host "❌ Logo belum ditemukan!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Cara menambahkan logo:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Simpan gambar logo BabyGrow Anda" -ForegroundColor White
    Write-Host "2. Rename file menjadi: babygrow-logo.png" -ForegroundColor White
    Write-Host "3. Copy ke folder:" -ForegroundColor White
    Write-Host "   $PSScriptRoot\mobile-app\assets\" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Jalankan script ini lagi untuk verifikasi" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Format yang disarankan:" -ForegroundColor Yellow
    Write-Host "   - PNG dengan background transparan" -ForegroundColor White
    Write-Host "   - Ukuran: 512x512 atau 1024x1024 pixels" -ForegroundColor White
    Write-Host "   - Nama: babygrow-logo.png (lowercase)" -ForegroundColor White
    Write-Host ""
    
    # Buka folder assets di explorer
    $assetsFolder = "$PSScriptRoot\mobile-app\assets"
    if (Test-Path $assetsFolder) {
        Write-Host "🗂️  Membuka folder assets..." -ForegroundColor Cyan
        Start-Process explorer.exe -ArgumentList $assetsFolder
    }
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Tekan Enter untuk keluar..." -ForegroundColor Gray
Read-Host
