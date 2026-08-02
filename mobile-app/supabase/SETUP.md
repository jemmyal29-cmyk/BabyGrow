# BabyGrow — Setup Supabase + EAS (lengkap)

Jalankan **berurutan** di **SQL Editor** (selalu **New query**, jangan reuse history lama).

## Checklist DB

| # | Aksi | File / tempat |
|---|------|----------------|
| 1 | Buat project Supabase | dashboard.supabase.com |
| 2 | Copy **Project URL** + **anon key** | Settings → API → `mobile-app/.env` |
| 3 | Jalankan schema | `schema.sql` |
| 3b | Jika error kolom `email` | `migrate-profiles.sql` |
| 3c | Fix RLS admin (`role_app`) | `fix-rls-role-app.sql` |
| 4 | Jalankan seed WHO + resep | `seed.sql` |
| 5 | Buat 2 user Auth | Authentication → Users → Add user |
| 6 | Promosikan 1 jadi admin | `promote-admin.sql` (ganti email) |
| 7 | Enable Realtime | Database → Replication → `measurements` ON |
| 8 | Verifikasi | `verify-and-rbac.sql` |
| 9 | Jika **tambah anak gagal** simpan | `fix-save-child.sql` (profil + RLS) |
| 10 | Data **orang tua** (tinggi/berat/darah) ke cloud | `migrate-parental-metrics.sql` |

## Isi `.env` (app)

```env
EXPO_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_MQTT_WS_URL=wss://broker.emqx.io:8084/mqtt
EXPO_PUBLIC_MQTT_TOPIC=babygrow/data/sensor
EXPO_PUBLIC_GEMINI_API_KEY=
```

## EAS Secrets (build APK)

Nama harus sama dengan di atas (**bukan** `EXPO_PUBLIC_MQTT_BROKER`):

```bash
cd mobile-app
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value "https://….supabase.co" --force
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "ey…" --force
eas secret:create --scope project --name EXPO_PUBLIC_MQTT_WS_URL --value "wss://broker.emqx.io:8084/mqtt" --force
eas secret:create --scope project --name EXPO_PUBLIC_MQTT_TOPIC --value "babygrow/data/sensor" --force
eas secret:create --scope project --name EXPO_PUBLIC_GEMINI_API_KEY --value "AIza…" --force

# atau dari .env:
set -a && source .env && set +a && bash scripts/eas-set-secrets.sh

eas secret:list
eas build --profile preview --platform android
```

## Deploy

- Backend: **Supabase**
- APK: **EAS** (`eas build --profile preview --platform android`)
