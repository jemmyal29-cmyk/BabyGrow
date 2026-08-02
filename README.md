# BabyGrow

<p align="center">
  <img src="mobile-app/assets/images/logo-babygrow.png" alt="BabyGrow" width="120" />
</p>

<p align="center">
  <strong>Pemantauan pertumbuhan balita</strong> untuk deteksi dini risiko stunting<br/>
  Expo · Supabase · HiveMQ MQTT · BLE · WHO LMS · Gemini AI
</p>

<p align="center">
  <code>mobile-app/</code> · <code>firmware/ESP32_MQTT_HiveMQ/</code> · <code>docs/</code>
</p>

---

## Ringkasan

| | |
|---|---|
| **Platform** | Android / iOS / Web — Expo SDK 54 |
| **Backend** | Supabase Auth + PostgreSQL + RLS |
| **Peran** | Orang Tua (`ROLE_USER`) · Petugas (`ROLE_ADMIN`) |
| **Ukur** | Manual · BLE · **MQTT HiveMQ (live)** · AI Vision |
| **Analisis** | WHO LMS (TB/U, BB/U, BB/TB) + status Kemenkes |
| **Nutrisi** | Resep MBG + asisten AI |
| **Brand** | Primary `#b60059` · Plus Jakarta Sans |

---

## Fitur utama

1. **Auth** — daftar, masuk, lupa password (Supabase)
2. **Beranda orang tua** — anak aktif, quick menu, **Ukur Live** (MQTT)
3. **Dashboard petugas** — ringkasan balita, cari, export CSV, health check
4. **Data anak** — profil + data orang tua + mid-parental height
5. **Pengukuran** — manual / alat BLE / MQTT HiveMQ / kamera AI
6. **Z-score medis** — Supabase `who_standards` → fallback LMS lokal
7. **Grafik pertumbuhan** — tren vs WHO
8. **Resep MBG** + panduan & bantuan (bahasa awam)
9. **Offline queue** — pengukuran tersimpan saat jaringan Posyandu putus

---

## Arsitektur IoT (HiveMQ)

```
ESP32 (sensor)          HiveMQ Cloud              Mobile App
VL53L1X + HX711   →     MQTT TLS :8883      →     WSS :8884
publish JSON            babygrow/measurements     useBabyGrowMQTT
                                                    ↓
                                          MeasurementSyncService
                                                    ↓
                                               Supabase + WHO Z
```

**Payload ESP32 → app**

```json
{"device_id":"BG-NODE-01","weight":14.55,"height":82.1}
```

| Klien | Endpoint |
|--------|----------|
| ESP32 | `mqtts://…hivemq.cloud:8883` |
| App (Expo) | `wss://…hivemq.cloud:8884/mqtt` |
| Topic | `babygrow/measurements` |

Firmware: [`firmware/ESP32_MQTT_HiveMQ/`](firmware/ESP32_MQTT_HiveMQ/)  
Hook UI: `src/hooks/useBabyGrowMQTT.ts` · Layar: **Beranda → Ukur Live**

---

## Tech stack

```
Mobile     Expo ~54 · RN 0.81 · React 19 · TypeScript 5.9
Nav        React Navigation 7 + RBAC
State      Zustand · TanStack Query
Forms      react-hook-form + zod
Backend    @supabase/supabase-js
IoT        paho-mqtt (WSS) · react-native-ble-plx
AI         Google Gemini
Charts     react-native-chart-kit · react-native-svg
Build      EAS (development / preview / production)
Firmware   ESP32 Arduino · PubSubClient · VL53L1X · HX711
```

---

## Struktur proyek

```
BabyGrow/
├── README.md
├── docs/                              # Modul pembelajaran SMA/SMK
├── firmware/
│   └── ESP32_MQTT_HiveMQ/             # HiveMQ MQTT (production IoT)
│       ├── ESP32_MQTT_HiveMQ.ino
│       └── secrets.example.h
├── ESP32_BLE_Firmware.ino             # Jalur BLE (opsional)
└── mobile-app/
    ├── App.tsx
    ├── EAS-BUILD.md
    ├── .env.example
    ├── supabase/
    │   ├── schema.sql · seed.sql
    │   ├── seed-who-wfh.sql           # LMS BB/TB by length cm
    │   ├── fix-login-rls.sql
    │   └── SETUP.md
    └── src/
        ├── hooks/useBabyGrowMQTT.ts
        ├── utils/zScoreCalculator.ts  # WHO LMS + Kemenkes
        ├── constants/whoLocalFallback.ts
        ├── services/MQTTService.ts · MeasurementSyncService.ts
        └── screens/MeasurementScreen.tsx
```

---

## Quick start (mobile)

```bash
cd mobile-app
cp .env.example .env
# Isi Supabase + HiveMQ + Gemini (lihat di bawah)
npm install
npx expo start -c
```

Tekan `a` untuk Android. Development build disarankan untuk BLE; MQTT WSS jalan di Expo/dev client.

### Variabel lingkungan

```env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MQTT_WS_URL=wss://YOUR_CLUSTER.s1.eu.hivemq.cloud:8884/mqtt
EXPO_PUBLIC_MQTT_TOPIC=babygrow/measurements
EXPO_PUBLIC_MQTT_USERNAME=
EXPO_PUBLIC_MQTT_PASSWORD=
EXPO_PUBLIC_MQTT_CLIENT_PREFIX=babygrow
EXPO_PUBLIC_GEMINI_API_KEY=
```

Jangan commit `.env` atau Service Role key.

### Database (Supabase SQL Editor)

Urutan disarankan:

1. `supabase/schema.sql`
2. `supabase/seed.sql` — WFA + HFA + resep MBG
3. `supabase/seed-who-wfh.sql` — WFH LMS (45–110 cm)
4. `supabase/fix-login-rls.sql` — hilangkan recursion RLS
5. Opsional: `seed-demo-users.sql`, `promote-admin.sql`, `fix-save-child.sql`

Detail: [`mobile-app/supabase/SETUP.md`](mobile-app/supabase/SETUP.md)

| Peran | Email | Password (setelah reset SQL) |
|--------|--------|------------------------------|
| Orang tua | `parent@babygrow.local` | `Parent1234` |
| Petugas | `admin@babygrow.local` | `Admin1234` |

---

## Firmware ESP32 (HiveMQ)

```bash
# Arduino IDE
# Board: ESP32 Dev Module · 115200
# Libraries: PubSubClient, VL53L1X (Pololu), HX711
cp firmware/ESP32_MQTT_HiveMQ/secrets.example.h \
   firmware/ESP32_MQTT_HiveMQ/secrets.h
# Edit WiFi SSID/password + pastikan MQTT_USER/PASS HiveMQ
# Upload ESP32_MQTT_HiveMQ.ino
```

`DEMO_MODE 1` (default) mengirim data simulasi jika sensor belum siap — cocok uji **Ukur Live** di HP.

---

## WHO LMS & Kemenkes

\[
Z = \frac{(X/M)^{L}-1}{L\cdot S}\quad(L\neq 0),\qquad
Z = \frac{\ln(X/M)}{S}\quad(L=0)
\]

| Indikator | Cut-off (ringkas) |
|-----------|-------------------|
| **TB/U** | &lt; −3 Sangat Pendek · &lt; −2 Pendek · −2…+3 Normal · &gt; +3 Tinggi |
| **BB/U** | &lt; −3 Sangat Kurang · &lt; −2 Kurang · −2…+1 Normal · &gt; +1 Risiko lebih |
| **BB/TB** | &lt; −3 Gizi Buruk · … · &gt; +3 Obesitas |

Engine: `src/utils/zScoreCalculator.ts` (Supabase-first + circuit breaker lokal).

---

## Deploy APK (EAS)

Hanya perlu rebuild jika mendistribusikan **APK production**. Dev lewat Metro cukup **Reload**.

```bash
cd mobile-app
eas login
./scripts/eas-set-secrets.sh
eas build --platform android --profile preview --non-interactive
```

Panduan: [`mobile-app/EAS-BUILD.md`](mobile-app/EAS-BUILD.md)

---

## Modul pembelajaran

- Markdown: [`docs/MODUL-PEMBELAJARAN-BABYGROW.md`](docs/MODUL-PEMBELAJARAN-BABYGROW.md)
- PDF: [`docs/MODUL-PEMBELAJARAN-BABYGROW.pdf`](docs/MODUL-PEMBELAJARAN-BABYGROW.pdf)
- Generate PDF: `python3 docs/generate_modul_pdf.py`
- Desain UI: [`mobile-app/desain ui/desainuiux.md`](mobile-app/desain%20ui/desainuiux.md)

---

## Catatan

- Di UI: tulis **Orang Tua** / **Petugas**, bukan nama enum teknis.
- AI Vision = skrining, bukan diagnosis klinis.
- `firmware/**/secrets.h` dan `mobile-app/.env` di-gitignore.

---

**App** `3.0.0` · **Expo** `54` · Agustus 2026  
Universitas Indo Global Mandiri · Developed by Jemi Altio / Tio
