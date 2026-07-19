# BabyGrow

BabyGrow adalah aplikasi mobile Android berbasis React Native yang membantu pemantauan pertumbuhan balita dan dukungan gizi melalui integrasi IoT, analisis WHO z-score, dan rekomendasi nutrisi.

## Ringkasan

- Platform: `mobile-app/` (React Native / Expo)
- Tujuan: pantau tinggi/berat balita, deteksi risiko stunting, dan berikan rekomendasi nutrisi
- Status: struktur repo telah dibersihkan, dependensi runtime diabaikan oleh `.gitignore`

## Fitur Utama

- Pairing perangkat IoT dengan Bluetooth Low Energy (BLE)
- Modul pertumbuhan dengan perhitungan WHO z-score
- Profil anak, riwayat pengukuran, dan grafik pertumbuhan
- Rekomendasi nutrisi MBG yang disesuaikan
- Notifikasi pengingat dan peringatan risiko
- Tampilan modern dengan dukungan mode gelap

## Struktur Repository

- `mobile-app/` - sumber aplikasi mobile React Native
- `README.md` - ringkasan proyek dan panduan cepat

## Persiapan & Jalankan

1. Masuk ke folder aplikasi:
   ```powershell
   cd mobile-app
   ```
2. Install dependensi:
   ```powershell
   npm install
   ```
3. Jalankan aplikasi:
   ```powershell
   npm start
   ```

> Jika menggunakan Expo, gunakan `npx expo start` dan ikuti panduan pada terminal.

## Catatan Repository

File dan folder yang diabaikan oleh Git:
- `node_modules/`
- `mobile-app/node_modules/`
- `.expo/`
- `mobile-app/.expo/`
- log file (`*.log`)
- `.DS_Store`

## Kontribusi

Untuk perubahan besar, buat branch baru berdasarkan `main` dan ajukan pull request.
