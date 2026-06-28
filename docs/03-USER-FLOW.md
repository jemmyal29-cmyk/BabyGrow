# BabyGrow - User Flow & Journey Maps

## 🎯 Primary User Personas

### Persona 1: Ibu Sari (Primary Caregiver)
- **Age**: 28 tahun
- **Occupation**: Ibu rumah tangga
- **Tech Savviness**: Menengah
- **Children**: 1 anak (18 bulan)
- **Goals**: 
  - Memastikan anak tumbuh sehat
  - Mencegah stunting
  - Mendapat panduan nutrisi yang tepat
- **Pain Points**:
  - Bingung apakah pertumbuhan anak normal
  - Sulit mengingat jadwal pengukuran
  - Tidak tahu menu makanan bergizi

### Persona 2: Kader Posyandu
- **Age**: 35 tahun
- **Occupation**: Kader kesehatan
- **Tech Savviness**: Menengah-tinggi
- **Goals**:
  - Efisien dalam monitoring banyak balita
  - Data akurat dan ter-digitalisasi
  - Deteksi dini risiko stunting
- **Pain Points**:
  - Pencatatan manual memakan waktu
  - Sulit tracking pertumbuhan jangka panjang
  - Keterbatasan alat ukur

## 📱 Complete User Flows

### Flow 1: Onboarding & Registration (First Time User)

```
┌─────────────────────────────────────────────────────────────────┐
│                     ONBOARDING FLOW                             │
└─────────────────────────────────────────────────────────────────┘

[Splash Screen]
    │
    │ (3 seconds)
    │
    ▼
[Welcome Screen]
┌──────────────────────────────────────┐
│  Logo BabyGrow (Pink Scale Icon)     │
│                                       │
│  "Pantau Pertumbuhan Buah Hati       │
│   dengan Teknologi AI"                │
│                                       │
│  [Swipeable Slides]                   │
│  • Slide 1: Ilustrasi tracking growth │
│  • Slide 2: IoT integration visual    │
│  • Slide 3: AI-powered insights       │
│                                       │
│  ○ ● ○  (Indicator)                   │
│                                       │
│  [Mulai] [Skip]                       │
└──────────────────────────────────────┘
    │
    │ User taps "Mulai"
    │
    ▼
[Authentication Method Selection]
┌──────────────────────────────────────┐
│  Daftar / Masuk                       │
│                                       │
│  [📧 Daftar dengan Email]            │
│                                       │
│  [🔵 Lanjutkan dengan Google]        │
│                                       │
│  ────── atau ──────                   │
│                                       │
│  Sudah punya akun? [Masuk]           │
└──────────────────────────────────────┘
    │
    ├─── Option A: Email Registration ───┐
    │                                     │
    │                                     ▼
    │                        [Register with Email]
    │                        ┌──────────────────────────┐
    │                        │  Nama Lengkap            │
    │                        │  [____________]          │
    │                        │                          │
    │                        │  Email                   │
    │                        │  [____________]          │
    │                        │                          │
    │                        │  Password                │
    │                        │  [____________] 👁       │
    │                        │  Min. 8 karakter         │
    │                        │                          │
    │                        │  No. HP (opsional)       │
    │                        │  [____________]          │
    │                        │                          │
    │                        │  ☑ Setuju dengan S&K     │
    │                        │                          │
    │                        │  [Daftar]                │
    │                        └──────────────────────────┘
    │                                     │
    │                                     │ Submit
    │                                     │
    │                                     ▼
    │                        [Email Verification Screen]
    │                        ┌──────────────────────────┐
    │                        │  ✉️                      │
    │                        │  Verifikasi Email        │
    │                        │                          │
    │                        │  Kami telah mengirim     │
    │                        │  kode verifikasi ke:     │
    │                        │  sari***@gmail.com       │
    │                        │                          │
    │                        │  [_] [_] [_] [_] [_] [_]│
    │                        │                          │
    │                        │  Kirim ulang (60s)       │
    │                        └──────────────────────────┘
    │                                     │
    └─────────────────────────────────────┤
                                          │
    ┌─── Option B: Google OAuth ──────────┤
    │                                     │
    │ (Google Sign-In Flow)               │
    │                                     │
    └─────────────────────────────────────┤
                                          │
                                          ▼
                            [Add First Child Screen]
                            ┌──────────────────────────┐
                            │  Tambah Profil Anak      │
                            │                          │
                            │  📷 [Upload Foto]        │
                            │                          │
                            │  Nama Anak               │
                            │  [____________]          │
                            │                          │
                            │  Jenis Kelamin           │
                            │  ○ Laki-laki  ○ Perempuan│
                            │                          │
                            │  Tanggal Lahir           │
                            │  [📅 DD/MM/YYYY]        │
                            │                          │
                            │  Berat Lahir (opsional)  │
                            │  [____] kg               │
                            │                          │
                            │  Tinggi Lahir (opsional) │
                            │  [____] cm               │
                            │                          │
                            │  [Simpan]                │
                            │  [Lewati - bisa nanti]   │
                            └──────────────────────────┘
                                          │
                                          ▼
                            [Permissions Request]
                            ┌──────────────────────────┐
                            │  Izin Akses              │
                            │                          │
                            │  📍 Lokasi               │
                            │  Untuk menemukan Posyandu│
                            │  terdekat                │
                            │  [Izinkan] [Tolak]       │
                            │                          │
                            │  🔔 Notifikasi           │
                            │  Pengingat pengukuran    │
                            │  & rekomendasi           │
                            │  [Izinkan] [Tolak]       │
                            │                          │
                            │  📶 Bluetooth            │
                            │  Koneksi ke perangkat IoT│
                            │  [Izinkan] [Tolak]       │
                            └──────────────────────────┘
                                          │
                                          ▼
                                   [Home Screen]
```

### Flow 2: Adding Child Profile (Additional Child)

```
[Home Screen]
    │
    │ User taps "Tambah Anak" button
    │
    ▼
[Add Child Form]
┌────────────────────────────────────────┐
│  ← Tambah Anak Baru                    │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     [Tap untuk upload foto]     │   │
│  │            📷                    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Nama Lengkap *                         │
│  ┌─────────────────────────────────┐   │
│  │ Ahmad Zaki                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Nama Panggilan                         │
│  ┌─────────────────────────────────┐   │
│  │ Zaki                            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Jenis Kelamin *                        │
│  ┌──────────────┐ ┌──────────────┐    │
│  │ ♂ Laki-laki  │ │ ♀ Perempuan  │    │
│  └──────────────┘ └──────────────┘    │
│     (selected)        (default)        │
│                                         │
│  Tanggal Lahir *                        │
│  ┌─────────────────────────────────┐   │
│  │ 15 Juni 2023          📅       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Usia: 18 bulan 8 hari (auto-calc)     │
│                                         │
│  ═══ Data Kelahiran (Opsional) ═══     │
│                                         │
│  Berat Lahir                            │
│  ┌──────────────────┐                  │
│  │ 3.2              │ kg               │
│  └──────────────────┘                  │
│                                         │
│  Panjang Lahir                          │
│  ┌──────────────────┐                  │
│  │ 49.5             │ cm               │
│  └──────────────────┘                  │
│                                         │
│  Lingkar Kepala                         │
│  ┌──────────────────┐                  │
│  │ 34.0             │ cm               │
│  └──────────────────┘                  │
│                                         │
│  Catatan Tambahan                       │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Batal]           [Simpan Profil]     │
└────────────────────────────────────────┘
    │
    │ User taps "Simpan Profil"
    │
    ▼
[Success Dialog]
┌────────────────────────────────────────┐
│           ✅                            │
│                                         │
│  Profil Zaki berhasil ditambahkan!     │
│                                         │
│  Lakukan pengukuran pertama?           │
│                                         │
│  [Nanti Saja]  [Ukur Sekarang]         │
└────────────────────────────────────────┘
```

### Flow 3: Manual Measurement Entry

```
[Home Screen / Child Detail]
    │
    │ User taps "Input Manual" button
    │
    ▼
[Manual Measurement Form]
┌────────────────────────────────────────┐
│  ← Input Pengukuran Manual             │
│                                         │
│  Untuk: Zaki (18 bulan)                │
│                                         │
│  Tanggal & Waktu Pengukuran            │
│  ┌─────────────────────────────────┐   │
│  │ 23 Des 2025, 09:30      📅🕐   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Berat Badan *                          │
│  ┌────────────────┐                    │
│  │ 10.2           │ kg                 │
│  └────────────────┘                    │
│  ├────────────────────────────┤        │
│  5 kg                        20 kg     │
│                                         │
│  Tinggi Badan *                         │
│  ┌────────────────┐                    │
│  │ 78.5           │ cm                 │
│  └────────────────┘                    │
│  ├────────────────────────────┤        │
│  50 cm                      110 cm     │
│                                         │
│  Lingkar Kepala (opsional)              │
│  ┌────────────────┐                    │
│  │ 46.0           │ cm                 │
│  └────────────────┘                    │
│                                         │
│  Catatan                                │
│  ┌─────────────────────────────────┐   │
│  │ Diukur di Posyandu              │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ⚠️ Peringatan:                        │
│  Tinggi badan lebih rendah 2 cm        │
│  dari pengukuran terakhir.             │
│  Pastikan data sudah benar.            │
│                                         │
│  [Batal]              [Simpan]         │
└────────────────────────────────────────┘
    │
    │ User confirms and saves
    │
    ▼
[Processing Screen]
┌────────────────────────────────────────┐
│                                         │
│            ⏳ Loading...                │
│                                         │
│   Menganalisis data dengan AI...       │
│                                         │
│   [Progress indicator]                 │
└────────────────────────────────────────┘
    │
    │ AI analysis complete
    │
    ▼
[Assessment Result Screen]
```

### Flow 4: IoT-Based Measurement

```
[Home Screen]
    │
    │ User taps "Ukur dengan Alat" or "Connect Device"
    │
    ▼
[Device Selection Screen]
┌────────────────────────────────────────┐
│  ← Perangkat IoT                       │
│                                         │
│  Perangkat Tersimpan:                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📱 BabyGrow Scale #001          │   │
│  │ Timbangan + Pengukur Tinggi     │   │
│  │ Status: ● Terhubung             │   │
│  │ Baterai: 87%  🔋🔋🔋           │   │
│  │                      [Pilih]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📱 BabyGrow Scale #042          │   │
│  │ Timbangan                        │   │
│  │ Status: ○ Tidak terhubung       │   │
│  │                   [Hubungkan]   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [+ Tambah Perangkat Baru]              │
└────────────────────────────────────────┘
    │
    ├─── New Device ──────────────────────┐
    │                                     │
    │                                     ▼
    │                        [BLE Scan Screen]
    │                        ┌──────────────────────┐
    │                        │  🔍 Mencari Perangkat│
    │                        │                      │
    │                        │  Pastikan perangkat  │
    │                        │  sudah menyala dan   │
    │                        │  dalam jangkauan     │
    │                        │                      │
    │                        │  [●●●●○] Scanning... │
    │                        │                      │
    │                        │  Ditemukan:          │
    │                        │  • BabyGrow-SC-042   │
    │                        │    Signal: -45 dBm   │
    │                        │    [Hubungkan]       │
    │                        │                      │
    │                        │  [Batal]             │
    │                        └──────────────────────┘
    │                                     │
    │                                     ▼
    │                        [Pairing Screen]
    │                        ┌──────────────────────┐
    │                        │  Masukkan PIN        │
    │                        │  (tertera di device) │
    │                        │                      │
    │                        │  [_][_][_][_]        │
    │                        │                      │
    │                        │  [Hubungkan]         │
    │                        └──────────────────────┘
    │                                     │
    └─────────────────────────────────────┤
                                          │
                                          ▼
                            [Measurement in Progress]
                            ┌──────────────────────────┐
                            │  📊 Pengukuran Aktif     │
                            │                          │
                            │  Perangkat: SC-001       │
                            │  Untuk: Zaki             │
                            │                          │
                            │  ┌─────────────────┐    │
                            │  │   🧍             │    │
                            │  │                 │    │
                            │  │  Letakkan anak  │    │
                            │  │  di alat ukur   │    │
                            │  │                 │    │
                            │  └─────────────────┘    │
                            │                          │
                            │  Status: Menunggu...     │
                            │  [●○○○○] 20%            │
                            │                          │
                            │  [Batal Pengukuran]      │
                            └──────────────────────────┘
                                          │
                                          │ Data received
                                          │
                                          ▼
                            [Measurement Confirmation]
                            ┌──────────────────────────┐
                            │  ✅ Data Diterima         │
                            │                          │
                            │  Berat: 10.2 kg          │
                            │  Tinggi: 78.5 cm         │
                            │                          │
                            │  ⚠️ Nilai tidak biasa?   │
                            │                          │
                            │  [Ukur Ulang]            │
                            │  [Konfirmasi & Simpan]   │
                            └──────────────────────────┘
                                          │
                                          ▼
                            [Processing & AI Analysis]
                                          │
                                          ▼
                            [Assessment Result Screen]
```

### Flow 5: Viewing AI Assessment Results

```
[Assessment Result Screen]
┌────────────────────────────────────────┐
│  ← Hasil Analisis                      │
│                                         │
│  Zaki • 18 bulan • Laki-laki           │
│  Diukur: 23 Des 2025, 09:30            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Status Pertumbuhan             │   │
│  │                                  │   │
│  │   ⚠️ PERLU PERHATIAN              │   │
│  │                                  │   │
│  │   Anak berisiko stunting         │   │
│  │   Confidence: 87%                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ═══ Detail Pengukuran ═══             │
│                                         │
│  Berat Badan: 10.2 kg                  │
│  ├─────●──────────────────┤            │
│  5 kg          Normal        20 kg     │
│  Z-Score: -0.5 (Normal)                │
│                                         │
│  Tinggi Badan: 78.5 cm                 │
│  ├──────────────●──────────┤           │
│  60 cm      Di Bawah      100 cm       │
│  Z-Score: -2.3 (Rendah) ⚠️             │
│                                         │
│  BB/TB: Proporsional                   │
│  Lingkar Kepala: Normal                │
│                                         │
│  ═══ Faktor Risiko ═══                 │
│                                         │
│  • Tinggi badan signifikan di bawah    │
│    standar WHO untuk usia 18 bulan     │
│  • Kecepatan pertumbuhan melambat      │
│    dalam 3 bulan terakhir              │
│  • Rasio BB/TB masih proporsional      │
│                                         │
│  [Lihat Grafik Pertumbuhan]            │
│  [Rekomendasi Nutrisi]                 │
│  [Konsultasi Tenaga Kesehatan]         │
│                                         │
│  💡 Tip: Konsultasikan dengan dokter   │
│     atau ahli gizi untuk penanganan    │
│     yang tepat.                         │
└────────────────────────────────────────┘
    │
    │ User taps "Rekomendasi Nutrisi"
    │
    ▼
[Nutrition Recommendation Screen]
```

### Flow 6: Meal Plan & MBG Recommendations

```
[Nutrition Recommendation Screen]
┌────────────────────────────────────────┐
│  ← Rekomendasi Nutrisi                 │
│                                         │
│  Untuk: Zaki (18 bulan)                │
│  Berdasarkan: Hasil analisis AI        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🎯 Target Nutrisi Harian        │   │
│  │                                  │   │
│  │  Kalori:    1000 kkal           │   │
│  │  Protein:   15 g                │   │
│  │  Karbohidrat: 150 g             │   │
│  │  Lemak:     35 g                │   │
│  │  Vitamin A, D, Zat Besi        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ═══ Program MBG yang Sesuai ═══       │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🥘 Bubur Kacang Hijau + Telur   │   │
│  │                                  │   │
│  │ ⭐⭐⭐⭐⭐ (4.8)                    │   │
│  │                                  │   │
│  │ ✓ Tinggi protein                │   │
│  │ ✓ Kaya zat besi                 │   │
│  │ ⏱ 20 menit                      │   │
│  │                                  │   │
│  │ [Lihat Resep] [+ Jadwalkan]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🍲 Sop Ayam Sayuran              │   │
│  │                                  │   │
│  │ ⭐⭐⭐⭐⭐ (4.9)                    │   │
│  │                                  │   │
│  │ ✓ Bergizi seimbang              │   │
│  │ ✓ Mudah dicerna                 │   │
│  │ ⏱ 30 menit                      │   │
│  │                                  │   │
│  │ [Lihat Resep] [+ Jadwalkan]    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Buat Rencana Makan Mingguan]         │
│  [Lihat Semua Resep]                   │
└────────────────────────────────────────┘
    │
    │ User taps "Buat Rencana Makan"
    │
    ▼
[Meal Plan Creator]
┌────────────────────────────────────────┐
│  ← Rencana Makan Mingguan              │
│                                         │
│  Periode: 23 - 29 Desember 2025        │
│                                         │
│  📅 Senin, 23 Des                      │
│  ┌─────────────────────────────────┐   │
│  │ 🌅 Sarapan (07:00)              │   │
│  │ Bubur Kacang Hijau              │   │
│  │ [Ubah] [Hapus]                  │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ ☀️ Snack Pagi (10:00)           │   │
│  │ [+ Tambah Menu]                 │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🌞 Makan Siang (12:00)          │   │
│  │ Sop Ayam Sayuran                │   │
│  │ [Ubah] [Hapus]                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  📅 Selasa, 24 Des                     │
│  [Tambah Jadwal Makan]                 │
│                                         │
│  ⚙️ Pengaturan:                        │
│  ☑ Aktifkan pengingat                  │
│  ☑ Kirim notifikasi 30 menit sebelum   │
│                                         │
│  [Simpan Rencana]                      │
└────────────────────────────────────────┘
```

### Flow 7: Viewing Growth Charts

```
[Child Detail Screen]
    │
    │ User taps "Lihat Grafik Pertumbuhan"
    │
    ▼
[Growth Charts Screen]
┌────────────────────────────────────────┐
│  ← Grafik Pertumbuhan                  │
│                                         │
│  Zaki • Laki-laki • 18 bulan           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ [BB] [TB] [BB/TB] [LK]           │  │
│  │  •    ─    ─       ─             │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Berat Badan menurut Usia              │
│  Periode: ● 6 bulan ○ 1 tahun ○ All   │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ 12 kg ┤                           │  │
│  │       │     +2 SD ───────         │  │
│  │ 11 kg ┤                           │  │
│  │       │     Median ─────          │  │
│  │ 10 kg ┤         ●●●●              │  │
│  │       │      ●●●                  │  │
│  │  9 kg ┤   ●●●                     │  │
│  │       │ ●●                        │  │
│  │  8 kg ┤●        -2 SD ─────       │  │
│  │       │                           │  │
│  │  7 kg ┤                           │  │
│  │       └─┬───┬───┬───┬───┬───     │  │
│  │        0  3m  6m  9m  12m 18m    │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Status Saat Ini:                      │
│  • Berat: 10.2 kg (Z-score: -0.5)     │
│  • Kategori: Normal ✅                 │
│                                         │
│  Tren Pertumbuhan:                     │
│  📈 Naik konsisten dalam 6 bulan       │
│                                         │
│  [Download PDF] [Bagikan]              │
└────────────────────────────────────────┘
```

### Flow 8: Notification Handling

```
[Notification Received - Lock Screen]
┌────────────────────────────────────────┐
│  BabyGrow                        10:00 │
│  ────────────────────────────────────  │
│  ⏰ Waktunya Snack Pagi!               │
│  Bubur Kacang Hijau untuk Zaki         │
│  [Buka] [Tutup]                        │
└────────────────────────────────────────┘
    │
    │ User taps "Buka"
    │
    ▼
[Meal Reminder Detail]
┌────────────────────────────────────────┐
│  ← Pengingat Makan                     │
│                                         │
│  Untuk: Zaki                           │
│  Waktu: 10:00 WIB                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  🥘 Bubur Kacang Hijau + Telur  │   │
│  │                                  │   │
│  │  [Recipe Image]                 │   │
│  │                                  │   │
│  │  • Kacang hijau 50g             │   │
│  │  • Telur ayam 1 butir           │   │
│  │  • Santan 100ml                 │   │
│  │                                  │   │
│  │  [Lihat Cara Memasak]           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Apakah sudah diberikan?               │
│                                         │
│  [Ya, Sudah] [Belum] [Ganti Menu]      │
└────────────────────────────────────────┘
```

## 🔄 Key Decision Points

### Decision Tree: Stunting Risk Response

```
AI Assessment Result
    │
    ├─── Normal ──────────────────────────┐
    │                                     │
    │                                     ▼
    │                        • Continue monitoring
    │                        • Regular measurement reminders
    │                        • Preventive nutrition tips
    │
    ├─── At Risk ─────────────────────────┐
    │                                     │
    │                                     ▼
    │                        • Show warning notification
    │                        • Personalized meal plan (MBG)
    │                        • Bi-weekly measurement reminder
    │                        • Educational content
    │
    ├─── Stunted ─────────────────────────┐
    │                                     │
    │                                     ▼
    │                        • Urgent notification
    │                        • Intensive meal plan
    │                        • Weekly measurement
    │                        • Suggest health facility visit
    │                        • Alert to registered Posyandu
    │
    └─── Severely Stunted ────────────────┐
                                          │
                                          ▼
                             • Critical alert
                             • Immediate medical consultation
                             • Direct referral to healthcare
                             • Daily nutrition monitoring
                             • Intensive follow-up
```

## ⏱️ Estimated Time Per Flow

| User Flow | Estimated Time | Complexity |
|-----------|---------------|------------|
| Registration (Email) | 3-5 minutes | Medium |
| Add Child Profile | 2-3 minutes | Low |
| Manual Measurement | 1-2 minutes | Low |
| IoT Measurement (existing device) | 30-60 seconds | Low |
| IoT Device Pairing | 2-4 minutes | Medium |
| View Assessment Results | 1-2 minutes | Low |
| Create Meal Plan | 5-10 minutes | Medium |
| View Growth Charts | 1-2 minutes | Low |

---

**Next**: See `04-UI-MOCKUPS.md` for visual wireframes and design specifications.
