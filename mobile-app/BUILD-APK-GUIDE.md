# 📦 BabyGrow - APK Build Guide

## 🎯 Build APK dengan EAS Build

### Prerequisites:
✅ EAS CLI installed
✅ Expo account (jemmyal29@gmail.com)
✅ Project configured

---

## 🚀 Quick Build

### Opsi 1: PowerShell Script (Recommended)
```powershell
cd C:\BabyGrow\mobile-app
.\build-apk.ps1
```

### Opsi 2: Manual Command
```powershell
cd C:\BabyGrow\mobile-app
$env:EAS_NO_VCS='1'
eas build --platform android --profile preview
```

---

## 📋 Build Profiles

### 1. **Preview** (Testing/Demo)
```json
"preview": {
  "distribution": "internal",
  "android": {
    "buildType": "apk"
  }
}
```
- ✅ Langsung bisa install di HP
- ✅ Tidak perlu Play Store
- ✅ Untuk testing & demo
- 📱 File: .apk (~50MB)

### 2. **Production** (Release)
```json
"production": {
  "android": {
    "buildType": "apk"
  }
}
```
- ✅ Production-ready
- ✅ Optimized & minified
- ✅ Signing keys included
- 📱 File: .apk (~40MB)

---

## 🔄 Build Process Flow

```
1. Local Code
    ↓
2. Upload to Expo Servers
    ↓
3. Install Dependencies (npm install)
    ↓
4. Build JavaScript Bundle
    ↓
5. Compile Native Code (Android)
    ↓
6. Create APK File
    ↓
7. Download Ready! ✅
```

**Duration:** 5-10 minutes

---

## 📥 Download & Install

### Setelah Build Selesai:

1. **Buka Link Build**
   - Link akan muncul di terminal
   - Atau buka: https://expo.dev/accounts/tiozo/projects/babygrow-mobile/builds

2. **Download APK**
   - Klik tombol "Download"
   - File: `babygrow-v2.0.0-preview.apk`
   - Size: ~40-50MB

3. **Transfer ke HP**
   - USB cable
   - Email
   - Google Drive
   - WhatsApp (file mode)

4. **Install di HP**
   - Tap file .apk
   - Allow "Install from Unknown Sources"
   - Tap "Install"
   - Tap "Open"

---

## 🛠️ Build Commands Reference

### Build for Testing (APK)
```bash
eas build --platform android --profile preview
```

### Build for Production
```bash
eas build --platform android --profile production
```

### Build Without Git
```bash
$env:EAS_NO_VCS='1'
eas build --platform android --profile preview
```

### Check Build Status
```bash
eas build:list
```

### View Build Details
```bash
eas build:view [BUILD_ID]
```

---

## 📱 App Info Setelah Build

```
App Name: BabyGrow
Package: com.babygrow.app
Version: 2.0.0-unicorn
Min Android: 6.0 (API 23)
Target Android: 14 (API 34)
Permissions:
  - Camera
  - Storage
  - Bluetooth
  - Location
  - Notifications
Size: ~40-50MB
```

---

## 🔐 Signing (Auto-handled by EAS)

EAS Build automatically handles:
- ✅ Keystore generation
- ✅ App signing
- ✅ Credentials management
- ✅ Secure key storage

No manual setup needed! 🎉

---

## 🌐 Build Monitoring

Monitor build progress:
1. **Terminal** - Real-time logs
2. **Web Dashboard** - https://expo.dev
3. **Email** - Build completion notification

---

## ⚡ Fast Build Tips

### 1. Use Build Cache
```json
{
  "build": {
    "preview": {
      "cache": {
        "paths": ["node_modules"]
      }
    }
  }
}
```

### 2. Minimize Dependencies
- Remove unused packages
- Check package.json

### 3. Use Preview for Testing
- Faster than production
- Good for demos

---

## 🐛 Troubleshooting

### Problem: "Run this command inside a project directory"
**Solution:**
```powershell
cd C:\BabyGrow\mobile-app
# Verify you're in correct folder
Test-Path package.json  # Should return True
```

### Problem: Git errors
**Solution:**
```powershell
$env:EAS_NO_VCS='1'
# Then run build command
```

### Problem: Build fails - "Missing credentials"
**Solution:**
```bash
eas credentials
# Or let EAS auto-generate
```

### Problem: APK too large
**Solution:**
1. Enable ProGuard (minify)
2. Use AAB instead of APK
3. Remove unused assets

---

## 📊 Build Comparison

| Type | Size | Speed | Use Case |
|------|------|-------|----------|
| **Preview APK** | 50MB | 5-7 min | Testing, Demo |
| **Production APK** | 40MB | 7-10 min | Release, Distribution |
| **AAB** | 35MB | 8-12 min | Play Store Upload |

---

## 🎯 After Build Success

### 1. Test APK:
- Install on test device
- Check all features
- Test login
- Test measurements
- Test navigation

### 2. Share APK:
- Google Drive link
- Direct download
- QR code sharing
- Internal app distribution

### 3. Production Release:
- Build production profile
- Upload to Play Store
- Or distribute internally

---

## 📞 Support

Build issues? Check:
1. Expo status: https://status.expo.dev
2. Build logs in terminal
3. Dashboard: https://expo.dev

---

## 🎉 Success Criteria

Build successful when you see:
```
✅ Build finished
📦 APK ready for download
🔗 Download: https://expo.dev/...
```

---

**Ready to build?** Run:
```powershell
cd C:\BabyGrow\mobile-app
.\build-apk.ps1
```

🚀 **Good luck with your build!**
