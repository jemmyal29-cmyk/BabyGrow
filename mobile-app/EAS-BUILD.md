# BabyGrow — EAS Build (Android)

## Prerequisites
1. Logged in: `eas whoami` (account: haikalkalief / team haikalkaliefs-team)
2. Fill `mobile-app/.env` from `.env.example` (anon key only — never Service Role)
3. Push env vars to EAS:

```bash
cd mobile-app
chmod +x scripts/eas-set-secrets.sh
./scripts/eas-set-secrets.sh
```

## Profiles (`eas.json`)

| Profile | Use | Output |
|---------|-----|--------|
| `development` | Dev Client + BLE native | Debug APK |
| `preview` | Internal testing | Release APK |
| `production` | Store / wider release | Release APK |

## Build commands

```bash
cd mobile-app

# Internal APK (recommended for demo / testers)
eas build --platform android --profile preview --non-interactive

# Dev client (needed for real BLE; Expo Go often mocks BLE)
eas build --platform android --profile development --non-interactive
```

After build finishes, install from the Expo dashboard link or:

```bash
eas build:list --platform android --limit 5
eas build:run -p android --latest
```

## Notes
- BLE pairing needs a **development/preview build**, not Expo Go.
- `EXPO_PUBLIC_*` values are baked at build time from the matching EAS environment (`preview` / `development` / `production`).
- MQTT public broker is demo-grade; rotate Gemini key if it was ever committed/shared.
