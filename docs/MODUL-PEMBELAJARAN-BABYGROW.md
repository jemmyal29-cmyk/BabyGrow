# Modul Pembelajaran BabyGrow

**Versi 2.0 · Juli 2026** · Level: SMA / SMK (Informatika) · Proyek akademik UIGM

> Panduan belajar profesional: fitur aplikasi, database, rumus WHO, framework & cara pakai, IoT/AI, peta file, setup & deploy.  
> PDF tata letak brand: [`MODUL-PEMBELAJARAN-BABYGROW.pdf`](./MODUL-PEMBELAJARAN-BABYGROW.pdf)  
> Generate ulang: `python3 docs/generate_modul_pdf.py`

---

## Cara memakai modul ini

Bacalah bab berurutan. Fokus pada **fungsi teknologi**, **file kunci**, dan **alur data** — bukan menghafal semua nama library.

| Urutan | Isi |
|--------|-----|
| Bab 1–2 | Masalah stunting & gambaran arsitektur |
| Bab 3 | Framework & cara pakai (inti praktik) |
| Bab 4–5 | Fitur aplikasi & database |
| Bab 6 | Rumus WHO & mid-parental |
| Bab 7–9 | IoT, AI, peta file, setup & deploy |
| Bab 10 | Latihan + kunci |

---

## Bab 1 — Mengapa BabyGrow ada?

Stunting = tinggi anak jauh di bawah standar usianya. BabyGrow membantu orang tua dan petugas:

- mencatat tinggi & berat balita  
- menghitung status menurut **standar WHO**  
- memberi peringatan dini risiko stunting  
- menyambungkan alat ukur (Bluetooth / internet)  
- menyediakan resep MBG dan bantuan AI  

### Dua peran

| Di layar | Di database | Tugas |
|----------|-------------|--------|
| Orang Tua | `ROLE_USER` | Pantau anak sendiri |
| Petugas / Perawat | `ROLE_ADMIN` | Data kolektif + laporan |

> **Penting:** nama `ROLE_*` hanya untuk developer. Di UI jangan ditampilkan.

---

## Bab 2 — Arsitektur & tech stack

```
Expo App (React Native + TypeScript)
        │ HTTPS
        ▼
   Supabase (Auth + PostgreSQL + RLS)
      ▲ BLE          ▲ MQTT/WSS
   ESP32 alat     Broker MQTT
        │
   Google Gemini (chat + vision)
```

| Teknologi | Peran | Versi proyek |
|-----------|--------|--------------|
| Expo + React Native | Aplikasi mobile lintas platform | Expo 54 · RN 0.81 |
| TypeScript | JS + tipe data | 5.9 |
| React Navigation | Pindah layar + tab per role | v7 |
| Zustand | State login / sesi | 4.x |
| TanStack Query | Ambil & cache data cloud | 5.x |
| Zod + React Hook Form | Validasi form | — |
| Supabase | Auth, DB, RLS | JS SDK |
| BLE + MQTT | Alat → HP → cloud | ble-plx · paho |
| Gemini AI | Chat & vision | API |
| EAS Build | APK Android | Expo cloud |

**Analogi:** Expo = cetakan proyek; React Native = UI HP; Supabase = akun + database di internet; RLS = aturan siapa boleh lihat baris mana.

---

## Bab 3 — Framework & cara pakai

### 3.1 Expo

Folder kerja: `mobile-app/`.

```bash
cd mobile-app
npm install
npx expo start          # dev server
npx expo start --web    # uji browser
npx expo start --clear  # bersihkan cache
```

- Konfigurasi app: `app.json`  
- Profil build: `eas.json`  
- Env lokal: `.env` (dari `.env.example`)

### 3.2 React Native + TypeScript

- Layar: `src/screens/*.tsx`  
- Komponen: `src/components/`  
- Brand: `src/theme/` — primary `#b60059`, font Plus Jakarta Sans  

Pola umum: komponen fungsi + `useState` / hooks.

### 3.3 React Navigation + RBAC

File: `src/navigation/AppNavigatorRBAC.tsx`

1. Belum login → Auth stack  
2. `ROLE_USER` → UserTabs  
3. `ROLE_ADMIN` → AdminTabs  

### 3.4 Zustand

File: `src/store/authStore.ts` — `login`, `logout`, restore session. Dipakai banyak layar untuk data user.

### 3.5 TanStack Query

Hooks di `src/hooks/` (`useChildren`, `useMeasurements`, `useRecipes`, `useAdminDashboard`). Mengurus loading, cache, dan refresh setelah data berubah.

### 3.6 React Hook Form + Zod

Form panjang (tambah anak, dll.) divalidasi sebelum disimpan ke cloud.

### 3.7 Supabase

Env: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

```ts
const { data, error } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', userId);
```

1. **Auth** — daftar / masuk / keluar / reset password  
2. **Database** — `select` / `insert` / `update`  
3. **RLS** — filter baris menurut `auth.uid()` & role  

> Jangan commit Service Role key. Keamanan utama = RLS.

### 3.8 BLE, MQTT, Gemini (ringkas)

| Layanan | File | Env / catatan |
|---------|------|----------------|
| BLE | `BLEService.ts`, `PairingModal.tsx` | Perlu build EAS untuk BLE penuh |
| MQTT | `MQTTService.ts` | `EXPO_PUBLIC_MQTT_*` |
| Gemini | `GeminiAIService.ts` | `EXPO_PUBLIC_GEMINI_API_KEY` |

---

## Bab 4 — Fitur aplikasi

### Alur awal

1. `SplashScreen`  
2. Onboarding 5 slide (`OnboardingScreen`, `assets/images/onboarding/`)  
3. Login / daftar — key AsyncStorage: `@babygrow/onboarding_done_v4` di `App.tsx`

### Orang tua

| Fitur | File utama |
|-------|------------|
| Beranda | `UserDashboardScreen.tsx` |
| Anak | `ChildrenScreen`, `AddChildScreen`, `ChildDetailScreen` |
| Ukur manual | `ManualMeasurementScreen.tsx` |
| Pairing alat | `PairingModal` + `BLEService` |
| AI Vision | `AIVisionStadiometerScreen` + `GeminiAIService` |
| Grafik | `GrowthScreen`, `GrowthChartScreen` |
| Resep MBG | `RecipeListScreen`, `useRecipes` |
| AI Chat | `AIAssistantScreen` |
| Panduan | `GuideScreen`, `HelpScreen` |
| Profil | `ProfileScreen` |

### Petugas

- Dashboard: `AdminDashboardScreen` + `useAdminDashboard`  
- Export CSV: `csvExport.ts`  
- Health: `SystemHealthService.ts`

---

## Bab 5 — Struktur database

Sumber: `mobile-app/supabase/schema.sql`, `seed.sql`.

```
auth.users ──1:1──► profiles (role)
                      │ 1:N
                      ▼
                   children
                      │ 1:N
                      ▼
                 measurements

who_standards (LMS WHO)    recipes (MBG)
```

| Tabel | Isi penting |
|-------|-------------|
| `profiles` | id, email, full_name, role, lokasi |
| `children` | parent_id, name, gender, date_of_birth |
| `measurements` | height_cm, weight_kg, z_score_*, stunting_risk, source |
| `who_standards` | L, M, S per usia/gender/indikator |
| `recipes` | bahan[], langkah[], kalori, usia |

**`stunting_risk`:** `normal` | `at_risk` | `stunted` | `severe`  
**`source`:** `manual` | `ble` | `mqtt` | `ai_vision`

RLS: orang tua hanya data sendiri; petugas lebih luas. Perbaikan recursion: `fix-login-rls.sql`.

> Metrik orang tua (tinggi/berat/gol. darah) disimpan lokal: `parentalMetricsStorage.ts`.

---

## Bab 6 — Rumus & contoh

### WHO LMS

\[
Z = \frac{(X/M)^{L} - 1}{L \cdot S}
\]

| Simbol | Arti |
|--------|------|
| X | Tinggi (cm) / berat (kg) |
| L, M, S | Parameter WHO |
| Z | Jarak ke median (SD) |

Indikator: **HFA/TB/U** (stunting), WFA/BB/U, WFH/BB/TB.  
Kode: `zScoreCalculator.ts` · sync: `MeasurementSyncService.ts`.

### Klasifikasi (kode app)

| Kondisi | Level |
|---------|--------|
| Z ≥ −1 | normal |
| −2 ≤ Z < −1 | at_risk |
| −3 ≤ Z < −2 | stunted |
| Z < −3 | severe |

### Mid-parental (Tanner)

- Laki-laki: \((T_a + T_i + 13)/2\)  
- Perempuan: \((T_a + T_i - 13)/2\)  
- Kisaran ± 8,5 cm → `parentalGrowth.ts`

**Contoh:** ayah 170, ibu 155, anak laki → **169 cm** (kisaran ≈ 160,5–177,5).

### Golongan darah ABO

`possibleChildBloodTypes()` — kemungkinan anak dari kombinasi ortu (tanpa Rh).

---

## Bab 7 — IoT & AI

1. **BLE** — sambungan dekat (seperti earphone). Firmware: `ESP32_BLE_Firmware.ino`.  
2. **MQTT** — pesan sensor lewat internet/broker → app.  
3. **Sync** — usia bulan → LMS → z-score → `stunting_risk` → insert `measurements` → UI (React Query).  
4. **Gemini** — chat + estimasi tinggi dari foto (**skrining**, bukan alat klinis).

---

## Bab 8 — Peta file

| Lokasi | Isi |
|--------|-----|
| `App.tsx` | Splash → onboarding → navigator |
| `src/navigation/` | RBAC |
| `src/screens/` | UI |
| `src/services/` | BLE, MQTT, Sync, Gemini |
| `src/hooks/` | React Query |
| `src/store/` | Zustand |
| `src/utils/` | z-score, parental, CSV |
| `src/theme/` | Design tokens |
| `supabase/*.sql` | Schema & seed |
| `docs/` | Modul ini |

---

## Bab 9 — Setup & deploy

### Database

1. Buat project Supabase  
2. `schema.sql` → `seed.sql`  
3. Opsional: demo users, reset password, promote admin, fix RLS  

Demo: `parent@babygrow.local` / `Parent1234` · `admin@babygrow.local` / `Admin1234`

### Lokal

```bash
cd mobile-app
cp .env.example .env   # isi kunci
npm install
npx expo start
```

### Android (EAS)

```bash
cd mobile-app
eas login
./scripts/eas-set-secrets.sh
eas build --platform android --profile preview --non-interactive
```

| Profile | Kegunaan |
|---------|----------|
| development | Dev client + BLE |
| preview | APK uji internal |
| production | Rilis lebih luas |

Detail: [`mobile-app/EAS-BUILD.md`](../mobile-app/EAS-BUILD.md)

---

## Bab 10 — Latihan

1. Bedakan BLE vs MQTT dengan analogi.  
2. Sebutkan 3 peran Expo di proyek ini.  
3. Mid-parental laki: ayah 172, ibu 158 — hasil & kisaran ±8,5?  
4. Z = −2,4 → level?  
5. File pemutus UserTabs vs AdminTabs?  
6. Mengapa hanya anon key di mobile?  
7. Empat nilai `source` measurements?

### Kunci singkat

1. BLE = dekat/lokal; MQTT = pesan via internet/broker.  
2. Dev server, config native (`app.json`), build EAS.  
3. 171,5 cm → ≈ 163–180 cm.  
4. `stunted`.  
5. `AppNavigatorRBAC.tsx`.  
6. Service role terlalu berkuasa jika bocor; RLS + anon key.  
7. `manual`, `ble`, `mqtt`, `ai_vision`.

---

## Glosarium

| Istilah | Arti sederhana |
|---------|----------------|
| API | Cara program minta data ke layanan lain |
| RLS | Aturan baris database per pengguna |
| Z-score | Jarak ke median dalam satuan SD |
| LMS | Metode WHO (Lambda, Mu, Sigma) |
| MBG | Makan Bergizi Gratis (konteks resep) |
| APK | File pemasang Android |

---

**Brand:** `#b60059` · Plus Jakarta Sans · Mencerminkan kode aktual repositori (bukan arsitektur fiktif).
