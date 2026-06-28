# 🎨 Cara Memasang Logo BabyGrow

## Langkah-Langkah:

### 1. Simpan Logo
- Simpan gambar logo BabyGrow (yang dengan desain bayi dalam hati dan tangan) 
- Nama file: **`babygrow-logo.png`**
- Lokasi: **`c:\BabyGrow\mobile-app\assets\babygrow-logo.png`**

### 2. Format yang Disarankan
- **Format**: PNG (dengan background transparan lebih baik)
- **Ukuran**: 512x512 px atau 1024x1024 px
- **Nama**: `babygrow-logo.png` (huruf kecil semua)

### 3. Lokasi File
```
mobile-app/
  ├── assets/
  │   ├── babygrow-logo.png  ← TARUH LOGO DI SINI
  │   ├── icon.png
  │   └── splash.png
  └── src/
```

### 4. Setelah Logo Ditambahkan
Jalankan aplikasi dengan:
```powershell
cd mobile-app
npm start
```

## ✨ Hasil yang Akan Terlihat:

Tampilan Login Screen akan menampilkan:
- ✅ Logo BabyGrow bulat di atas dengan ukuran 140x140
- ✅ Teks "BabyGrow" dengan font bold pink
- ✅ Tagline "Kawal Tumbuh Kembang Sejak Dini" di bawahnya
- ✅ Form login dengan design elegant white card
- ✅ Background pink cerah

## 🔄 Jika Logo Tidak Muncul:

1. **Restart Metro Bundler** (tekan Ctrl+C di terminal, lalu npm start lagi)
2. **Clear cache**: `npm start -- --clear`
3. **Cek nama file**: Pastikan PERSIS `babygrow-logo.png` (lowercase semua)
4. **Cek lokasi**: Harus di folder `assets/` root, bukan di `src/`

## 💡 Tips:
- Gunakan logo dengan background transparan (PNG)
- Jika logo terlalu besar/kecil, ukurannya sudah diatur di kode (120x120)
- Logo akan otomatis ter-resize sesuai container

---

**Status**: ✅ Kode sudah diupdate, tinggal tambahkan file logo!
