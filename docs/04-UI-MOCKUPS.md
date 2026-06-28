# BabyGrow - UI/UX Design Mockups & Specifications

## 🎨 Design System

### Color Palette (Halodoc-inspired)

```css
/* Primary Colors */
--primary-pink: #FF69B4;          /* Hot Pink - Main brand color */
--primary-pink-light: #FFB6C1;    /* Light Pink - Hover states */
--primary-pink-dark: #C71585;     /* Deep Pink - Active states */
--primary-pink-50: rgba(255, 105, 180, 0.05);   /* Very light backgrounds */
--primary-pink-100: rgba(255, 105, 180, 0.1);   /* Light backgrounds */

/* Secondary Colors */
--secondary-coral: #FFA07A;       /* Light Salmon - Accents */
--secondary-peach: #FFD4B8;       /* Peach - Soft backgrounds */

/* Neutral Colors */
--white: #FFFFFF;
--gray-50: #FAFAFA;               /* Background */
--gray-100: #F5F5F5;              /* Card backgrounds */
--gray-200: #EEEEEE;              /* Borders */
--gray-300: #E0E0E0;              /* Disabled */
--gray-400: #BDBDBD;              /* Placeholders */
--gray-500: #9E9E9E;              /* Secondary text */
--gray-600: #757575;              /* Icons */
--gray-700: #616161;              /* Body text */
--gray-800: #424242;              /* Headings */
--gray-900: #212121;              /* Primary text */

/* Status Colors */
--success: #4CAF50;               /* Green - Success states */
--warning: #FFC107;               /* Amber - Warnings */
--error: #F44336;                 /* Red - Errors */
--info: #2196F3;                  /* Blue - Information */

/* Stunting Risk Colors */
--risk-normal: #4CAF50;           /* Green */
--risk-at-risk: #FFC107;          /* Yellow/Amber */
--risk-stunted: #FF9800;          /* Orange */
--risk-severe: #F44336;           /* Red */

/* Gradients */
--gradient-primary: linear-gradient(135deg, #FF69B4 0%, #FFA07A 100%);
--gradient-light: linear-gradient(135deg, #FFB6C1 0%, #FFD4B8 100%);
```

### Typography

```css
/* Font Family */
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-heading: 'Inter', sans-serif;

/* Font Sizes */
--text-xs: 12px;      /* Small labels, captions */
--text-sm: 14px;      /* Body text, secondary info */
--text-base: 16px;    /* Primary body text */
--text-lg: 18px;      /* Large body text */
--text-xl: 20px;      /* Section headers */
--text-2xl: 24px;     /* Page titles */
--text-3xl: 28px;     /* Large headings */
--text-4xl: 32px;     /* Hero text */

/* Font Weights */
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;

/* Line Heights */
--leading-tight: 1.2;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing System

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius

```css
--radius-sm: 4px;     /* Small elements */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards */
--radius-xl: 16px;    /* Large cards */
--radius-2xl: 24px;   /* Bottom sheets */
--radius-full: 9999px; /* Pills, circles */
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
```

## 📱 Screen Mockups (ASCII Wireframes)

### 1. Splash Screen & Logo

```
┌──────────────────────────────────────────┐
│                                          │
│                                          │
│                                          │
│                                          │
│              ┌──────────┐                │
│              │          │                │
│              │    ⚖️     │                │
│              │  PINK    │                │
│              │  SCALE   │                │
│              │   ICON   │                │
│              └──────────┘                │
│                                          │
│            BabyGrow                      │
│        ──────────────                    │
│                                          │
│     Pantau Pertumbuhan Buah Hati        │
│        dengan Teknologi AI               │
│                                          │
│                                          │
│                                          │
│            ●●●○○ Loading...              │
│                                          │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Background: White with subtle pink gradient
- Logo: Pink timbangan/scale icon (simplified, modern)
- Typography: Inter Bold for "BabyGrow"
- Loading indicator: Pink animated dots
- Transition: Smooth fade-in animation
```

### 2. Welcome/Onboarding Screens

```
╔══════════════════════════════════════════╗
║        ONBOARDING - SLIDE 1              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│      [X] Skip                            │
│                                          │
│                                          │
│        ┌────────────────────┐            │
│        │                    │            │
│        │   [ILLUSTRATION]   │            │
│        │   Parent holding   │            │
│        │   baby on scale    │            │
│        │   (Pink/Coral)     │            │
│        │                    │            │
│        └────────────────────┘            │
│                                          │
│                                          │
│      Pantau Pertumbuhan Balita          │
│                                          │
│   Catat berat, tinggi, dan lingkar      │
│   kepala anak dengan mudah              │
│                                          │
│                                          │
│            ●○○○ (Indicators)             │
│                                          │
│                                          │
│         [Lanjut →]                       │
│                                          │
└──────────────────────────────────────────┘

╔══════════════════════════════════════════╗
║        ONBOARDING - SLIDE 2              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│      [X] Skip                            │
│                                          │
│                                          │
│        ┌────────────────────┐            │
│        │                    │            │
│        │   [ILLUSTRATION]   │            │
│        │   IoT devices      │            │
│        │   connecting to    │            │
│        │   smartphone       │            │
│        │                    │            │
│        └────────────────────┘            │
│                                          │
│                                          │
│      Integrasi Perangkat IoT            │
│                                          │
│   Ukur otomatis dengan timbangan        │
│   dan alat ukur tinggi digital          │
│                                          │
│                                          │
│            ○●○○ (Indicators)             │
│                                          │
│                                          │
│         [Lanjut →]                       │
│                                          │
└──────────────────────────────────────────┘

╔══════════════════════════════════════════╗
║        ONBOARDING - SLIDE 3              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│      [X] Skip                            │
│                                          │
│                                          │
│        ┌────────────────────┐            │
│        │                    │            │
│        │   [ILLUSTRATION]   │            │
│        │   AI brain icon    │            │
│        │   with charts      │            │
│        │   & insights       │            │
│        │                    │            │
│        └────────────────────┘            │
│                                          │
│                                          │
│      Deteksi Risiko dengan AI           │
│                                          │
│   Analisis pertumbuhan dan dapatkan     │
│   rekomendasi nutrisi yang tepat        │
│                                          │
│                                          │
│            ○○●○ (Indicators)             │
│                                          │
│                                          │
│         [Mulai]                          │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Illustrations: Flat design, pink & coral palette
- Typography: Large headings (24px), body (16px)
- Buttons: Rounded (12px), primary pink
- Smooth slide transitions
```

### 3. Login Screen

```
╔══════════════════════════════════════════╗
║           LOGIN SCREEN                   ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Kembali                               │
│                                          │
│       ┌────────┐                         │
│       │  ⚖️💗  │  Logo (small)            │
│       └────────┘                         │
│                                          │
│         Masuk ke BabyGrow                │
│                                          │
│                                          │
│  Email atau No. HP                       │
│  ┌────────────────────────────────────┐  │
│  │ 📧 email@example.com               │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Password                                │
│  ┌────────────────────────────────────┐  │
│  │ 🔒 ••••••••••                  👁  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Lupa password?                  [Link] │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │           [MASUK]                  │  │
│  └────────────────────────────────────┘  │
│           (Pink button)                  │
│                                          │
│         ──── atau ────                   │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  🔵  Masuk dengan Google           │  │
│  └────────────────────────────────────┘  │
│           (White button)                 │
│                                          │
│                                          │
│  Belum punya akun? [Daftar di sini]     │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Clean, minimal design
- Input fields: Gray border, pink focus
- Primary button: Pink gradient
- Social login: White with border
- Error states: Red text below inputs
```

### 4. Home Screen (Main Dashboard)

```
╔══════════════════════════════════════════╗
║           HOME SCREEN                    ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ⚖️💗 BabyGrow          🔔(2)     ☰     │  <- Header
│                                          │
│  Halo, Ibu Sari! 👋                      │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ┌───┐  Zaki • 18 bulan          ▼│  │  <- Child Selector
│  │  │📷 │  Laki-laki                  │  │
│  │  └───┘  Terakhir diukur: 2 hari lalu│  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ STATUS PERTUMBUHAN                 │  │  <- Status Card
│  │                                    │  │
│  │ ⚠️ PERLU PERHATIAN                 │  │
│  │                                    │  │
│  │ Anak berisiko stunting             │  │
│  │ Berdasarkan pengukuran terakhir    │  │
│  │                                    │  │
│  │ [Lihat Detail →]                   │  │
│  └────────────────────────────────────┘  │
│         (Yellow/amber card)              │
│                                          │
│  Quick Actions:                          │
│  ┌──────────┐  ┌──────────┐             │
│  │   📊     │  │   ⚖️     │             │
│  │  Ukur    │  │  Ukur    │             │
│  │  Manual  │  │ dg Alat  │             │
│  └──────────┘  └──────────┘             │
│  ┌──────────┐  ┌──────────┐             │
│  │   📈     │  │   🥘     │             │
│  │  Grafik  │  │  Resep   │             │
│  │ Tumbuh   │  │   MBG    │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  Pengingat Hari Ini:                    │
│  ┌────────────────────────────────────┐  │
│  │ 🔔 10:00  Snack Pagi - Bubur       │  │
│  │           Kacang Hijau             │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │ 🔔 12:00  Makan Siang - Sop Ayam   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Tips Hari Ini:  💡                     │
│  ┌────────────────────────────────────┐  │
│  │ [Image]                            │  │
│  │ 5 Makanan Penambah Tinggi Badan   │  │
│  │ untuk Balita                       │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  [🏠] [👶] [📊] [🥘] [👤]              │  <- Bottom Nav
│  Home  Anak  Grafik Resep Profil        │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Header: Pink background with white text
- Child selector: White card with dropdown
- Status card: Color-coded by risk level
- Quick actions: Grid of icon buttons (pink)
- Bottom nav: Always visible, pink active state
```

### 5. Child Detail Screen

```
╔══════════════════════════════════════════╗
║        CHILD DETAIL SCREEN               ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Profil Anak              [✏️] [•••]  │
│                                          │
│            ┌──────────┐                  │
│            │          │                  │
│            │   📷     │  (Profile pic)   │
│            │  Zaki    │                  │
│            │          │                  │
│            └──────────┘                  │
│                                          │
│           Zaki Pratama                   │
│      Laki-laki • 18 bulan 8 hari        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  PENGUKURAN TERAKHIR               │  │
│  │  21 Desember 2025                  │  │
│  │                                    │  │
│  │  Berat:  10.2 kg (Normal)     ✅  │  │
│  │  Tinggi: 78.5 cm (Rendah)     ⚠️  │  │
│  │  Lingkar Kepala: 46.0 cm (Normal) │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  RIWAYAT PERTUMBUHAN               │  │
│  │                                    │  │
│  │  Berat Badan (6 bulan terakhir)   │  │
│  │  ┌──────────────────────────────┐ │  │
│  │  │  12kg ┤                       │ │  │
│  │  │  11kg ┤      ●●●●             │ │  │
│  │  │  10kg ┤   ●●●                 │ │  │
│  │  │   9kg ┤ ●●   (mini chart)     │ │  │
│  │  │       └─┬─┬─┬─┬─┬─            │ │  │
│  │  │        Jun Aug Oct Dec        │ │  │
│  │  └──────────────────────────────┘ │  │
│  │                                    │  │
│  │  [Lihat Grafik Lengkap →]         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  📅 Pengukuran Berikutnya          │  │
│  │  Minggu, 29 Desember 2025          │  │
│  │  [Atur Pengingat]                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │           [Ukur Sekarang]          │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  [🏠] [👶] [📊] [🥘] [👤]              │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Profile picture: Circle, pink border
- Stats cards: White with subtle shadows
- Mini charts: Simple line/area graphs
- CTA button: Large, pink, prominent
```

### 6. Manual Measurement Input

```
╔══════════════════════════════════════════╗
║      MANUAL MEASUREMENT SCREEN           ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Input Manual              [ℹ️ Help]  │
│                                          │
│  Untuk: Zaki (18 bulan)                 │
│                                          │
│  Tanggal & Waktu                         │
│  ┌────────────────────────────────────┐  │
│  │ 23 Des 2025, 09:30       📅 🕐    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  BERAT BADAN                       │  │
│  │                                    │  │
│  │         10.2 kg                    │  │
│  │        (Large text)                │  │
│  │                                    │  │
│  │  ├─────●──────────────────────┤   │  │
│  │  5                            20   │  │
│  │                                    │  │
│  │  Atau input manual: [10.2] kg     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  TINGGI BADAN                      │  │
│  │                                    │  │
│  │         78.5 cm                    │  │
│  │        (Large text)                │  │
│  │                                    │  │
│  │  ├──────────●────────────────┤    │  │
│  │  50                         110    │  │
│  │                                    │  │
│  │  Atau input manual: [78.5] cm     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  LINGKAR KEPALA (Opsional)         │  │
│  │                                    │  │
│  │  [46.0] cm                         │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Catatan                                 │
│  ┌────────────────────────────────────┐  │
│  │ Diukur di Posyandu                 │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    [Simpan & Analisis dengan AI]   │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Large, easy-to-read numbers
- Sliders for quick input
- Text input for precision
- Haptic feedback on slider
- Validation: Show warnings for unusual values
```

### 7. IoT Measurement Screen

```
╔══════════════════════════════════════════╗
║        IoT MEASUREMENT SCREEN            ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Ukur dengan Alat IoT                  │
│                                          │
│  Pilih Perangkat:                        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ● BabyGrow Scale #001              │  │
│  │   Timbangan + Tinggi               │  │
│  │   Status: Terhubung ✅  🔋 87%    │  │
│  └────────────────────────────────────┘  │
│         (Green border - active)          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ○ BabyGrow Scale #042              │  │
│  │   Timbangan                        │  │
│  │   Status: Tidak terhubung          │  │
│  │   [Hubungkan]                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [+ Tambah Perangkat Baru]              │
│                                          │
│  ──────────────────────────────────      │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  📊 PENGUKURAN AKTIF               │  │
│  │                                    │  │
│  │      ┌──────────────────┐          │  │
│  │      │                  │          │  │
│  │      │      🧍           │          │  │
│  │      │                  │          │  │
│  │      │  Letakkan anak   │          │  │
│  │      │  di alat ukur    │          │  │
│  │      │                  │          │  │
│  │      └──────────────────┘          │  │
│  │                                    │  │
│  │  Status: Menunggu data...          │  │
│  │                                    │  │
│  │  [●●●○○○○○] 30%                   │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Batal Pengukuran]                     │
│                                          │
└──────────────────────────────────────────┘

------ AFTER DATA RECEIVED ------

┌──────────────────────────────────────────┐
│  ← Konfirmasi Data                       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  ✅ DATA DITERIMA                   │  │
│  │                                    │  │
│  │  Berat:   10.2 kg                  │  │
│  │  Tinggi:  78.5 cm                  │  │
│  │                                    │  │
│  │  Waktu:   23 Des 2025, 09:32       │  │
│  │  Perangkat: BabyGrow Scale #001    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Apakah data sudah benar?               │
│                                          │
│  💡 Tinggi badan 2 cm lebih rendah      │
│     dari pengukuran sebelumnya          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │         [Ukur Ulang]               │  │
│  └────────────────────────────────────┘  │
│         (Secondary button)               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    [Konfirmasi & Lanjutkan]        │  │
│  └────────────────────────────────────┘  │
│         (Primary button)                 │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Real-time status updates
- Visual feedback (animations)
- Clear device status indicators
- Validation warnings
```

### 8. AI Assessment Result Screen

```
╔══════════════════════════════════════════╗
║       ASSESSMENT RESULT SCREEN           ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Hasil Analisis            [⤓ Download]│
│                                          │
│  Zaki • 18 bulan • Laki-laki            │
│  Diukur: 23 Des 2025, 09:30             │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │       ⚠️                            │  │
│  │                                    │  │
│  │   PERLU PERHATIAN                  │  │
│  │                                    │  │
│  │   Anak berisiko stunting           │  │
│  │   Confidence: 87%                  │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│       (Yellow/amber card)                │
│                                          │
│  ═══ Detail Pengukuran ═══              │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Berat Badan: 10.2 kg               │  │
│  │                                    │  │
│  │ ├────●──────────────────────┤     │  │
│  │ 5 kg    Normal        20 kg       │  │
│  │                                    │  │
│  │ Z-Score: -0.5                      │  │
│  │ Status: ✅ Normal                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Tinggi Badan: 78.5 cm              │  │
│  │                                    │  │
│  │ ├──────────────●────────────┤     │  │
│  │ 60 cm  Di Bawah Std   100 cm      │  │
│  │                                    │  │
│  │ Z-Score: -2.3                      │  │
│  │ Status: ⚠️ Rendah                  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Berat/Tinggi: Proporsional ✅      │  │
│  │ Lingkar Kepala: Normal ✅          │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ═══ Faktor Risiko ═══                  │
│  • Tinggi badan signifikan di bawah     │
│    standar WHO untuk usia 18 bulan      │
│  • Kecepatan pertumbuhan melambat       │
│    dalam 3 bulan terakhir               │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │     [Lihat Grafik Pertumbuhan]     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │       [Rekomendasi Nutrisi]        │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │    [Konsultasi Tenaga Kesehatan]   │  │
│  └────────────────────────────────────┘  │
│                                          │
│  💡 Konsultasikan dengan dokter atau    │
│     ahli gizi untuk penanganan tepat    │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Status card: Color-coded (green/yellow/red)
- Visual indicators: Progress bars for z-scores
- Clear hierarchy: Status → Details → Actions
- Actionable CTAs at bottom
```

### 9. Growth Chart Screen

```
╔══════════════════════════════════════════╗
║         GROWTH CHART SCREEN              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Grafik Pertumbuhan     [⤓] [⤴ Share] │
│                                          │
│  Zaki • Laki-laki • 18 bulan            │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ [BB/U] [TB/U] [BB/TB] [LK/U]     │    │
│  │   •     ─      ─       ─         │    │
│  └──────────────────────────────────┘    │
│                                          │
│  Berat Badan menurut Usia (BB/U)        │
│                                          │
│  Periode: ● 6 bln ○ 1 thn ○ Semua       │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │                                  │    │
│  │ 12kg ┤ ─────── +2 SD             │    │
│  │      │                           │    │
│  │ 11kg ┤ ─────── Median            │    │
│  │      │       ●●●●                │    │
│  │ 10kg ┤     ●●●                   │    │
│  │      │   ●●●                     │    │
│  │  9kg ┤ ●●                        │    │
│  │      │●                          │    │
│  │  8kg ┤ ─────── -2 SD             │    │
│  │      │                           │    │
│  │  7kg ┤ ─────── -3 SD             │    │
│  │      │                           │    │
│  │      └┬───┬───┬───┬───┬───┬──   │    │
│  │       0  3m  6m  9m 12m 18m      │    │
│  │                                  │    │
│  │  Legend:                         │    │
│  │  ● Data anak    ── WHO Standard  │    │
│  └──────────────────────────────────┘    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  STATUS SAAT INI                   │  │
│  │                                    │  │
│  │  Berat: 10.2 kg                    │  │
│  │  Z-score: -0.5                     │  │
│  │  Kategori: ✅ Normal               │  │
│  │                                    │  │
│  │  Tren: 📈 Naik konsisten           │  │
│  │  Pertumbuhan dalam 6 bulan baik    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Download PDF] [Bagikan]               │
│                                          │
├──────────────────────────────────────────┤
│  [🏠] [👶] [📊] [🥘] [👤]              │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Interactive charts (zoom, pan)
- Tabs for different metrics
- WHO standard curves clearly shown
- Color-coded zones (green/yellow/red)
- Trend indicators with icons
```

### 10. Recipe/MBG Screen

```
╔══════════════════════════════════════════╗
║          RECIPE LIST SCREEN              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  Resep Makanan Bergizi         [🔍]     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ [Semua] [Sarapan] [Snack] [Makan] │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Filter: Untuk Zaki (18 bulan)     [✓]  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  Bubur Kacang Hijau        │  │
│  │ │[📷]│  + Telur                    │  │
│  │ └────┘                             │  │
│  │        ⭐⭐⭐⭐⭐ 4.8               │  │
│  │                                    │  │
│  │        ✓ Tinggi protein            │  │
│  │        ✓ Kaya zat besi             │  │
│  │        ⏱ 20 menit                  │  │
│  │                                    │  │
│  │        [Lihat] [+ Jadwalkan]      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  Sop Ayam Sayuran           │  │
│  │ │[📷]│                             │  │
│  │ └────┘                             │  │
│  │        ⭐⭐⭐⭐⭐ 4.9               │  │
│  │                                    │  │
│  │        ✓ Bergizi seimbang          │  │
│  │        ✓ Mudah dicerna             │  │
│  │        ⏱ 30 menit                  │  │
│  │                                    │  │
│  │        [Lihat] [+ Jadwalkan]      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ┌────┐  Nasi Tim Ikan Salmon       │  │
│  │ │[📷]│                             │  │
│  │ └────┘                             │  │
│  │        ⭐⭐⭐⭐⭐ 4.7               │  │
│  │                                    │  │
│  │        ✓ Kaya Omega-3              │  │
│  │        ✓ Baik untuk otak           │  │
│  │        ⏱ 25 menit                  │  │
│  │                                    │  │
│  │        [Lihat] [+ Jadwalkan]      │  │
│  └────────────────────────────────────┘  │
│                                          │
├──────────────────────────────────────────┤
│  [🏠] [👶] [📊] [🥘] [👤]              │
└──────────────────────────────────────────┘

╔══════════════════════════════════════════╗
║        RECIPE DETAIL SCREEN              ║
╚══════════════════════════════════════════╝

┌──────────────────────────────────────────┐
│  ← Resep                    [❤️] [⤴]    │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │                                    │  │
│  │     [RECIPE IMAGE]                 │  │
│  │     Bubur Kacang Hijau             │  │
│  │                                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Bubur Kacang Hijau + Telur             │
│  ⭐⭐⭐⭐⭐ 4.8 (234 ulasan)             │
│                                          │
│  ⏱ 20 menit  │  👶 12-24 bulan  │  1 porsi│
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  INFORMASI GIZI (per porsi)        │  │
│  │                                    │  │
│  │  Kalori: 250 kkal                  │  │
│  │  Protein: 12 g                     │  │
│  │  Karbohidrat: 35 g                 │  │
│  │  Lemak: 8 g                        │  │
│  │  Zat Besi: 3 mg                    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ═══ Bahan-bahan ═══                    │
│  ☐ Kacang hijau - 50 g                  │
│  ☐ Telur ayam - 1 butir                 │
│  ☐ Santan - 100 ml                      │
│  ☐ Gula merah - 1 sdm                   │
│  ☐ Air - 300 ml                         │
│                                          │
│  [Buat Daftar Belanja]                  │
│                                          │
│  ═══ Cara Membuat ═══                   │
│  1. Cuci bersih kacang hijau            │
│  2. Rebus kacang hijau dengan air       │
│     hingga empuk (±15 menit)            │
│  3. Tambahkan santan dan gula merah     │
│  4. Rebus telur, kupas, dan haluskan    │
│  5. Campurkan telur ke dalam bubur      │
│  6. Aduk rata dan sajikan hangat        │
│                                          │
│  💡 Tips: Tambahkan pisang untuk        │
│           rasa lebih manis alami        │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │     [+ Jadwalkan untuk Zaki]       │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘

DESIGN NOTES:
- Appetizing food photos
- Clear nutrition info
- Interactive checklist for ingredients
- Easy-to-follow instructions
- Shopping list integration
```

## 🎨 Component Library

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #FF69B4, #FFA07A);
  color: white;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  shadow: 0 4px 12px rgba(255, 105, 180, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #FF69B4;
  border: 2px solid #FF69B4;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
}

/* Icon Button */
.btn-icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background: #FFB6C1;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Cards

```css
/* Standard Card */
.card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Status Card */
.card-status {
  background: white;
  border-radius: 16px;
  padding: 20px;
  border-left: 4px solid var(--status-color);
}

/* Info Card (colored) */
.card-info {
  background: linear-gradient(135deg, #FFB6C1, #FFD4B8);
  border-radius: 12px;
  padding: 16px;
}
```

### Input Fields

```css
/* Text Input */
.input-text {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #E0E0E0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.input-text:focus {
  border-color: #FF69B4;
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
}
```

### Bottom Navigation

```css
.bottom-nav {
  height: 64px;
  background: white;
  border-top: 1px solid #EEEEEE;
  display: flex;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
}

.nav-item.active {
  color: #FF69B4;
}
```

---

**Implementation Priority**: 
1. Core screens (Login, Home, Child Detail, Measurement)
2. Assessment & Results
3. Recipe/MBG features
4. Profile & Settings

**Design Files**: Create high-fidelity mockups using Figma based on these wireframes with actual pink timbangan logo and Halodoc-style visual elements.
