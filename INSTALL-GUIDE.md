# 🚀 BabyGrow - Panduan Instalasi Lengkap untuk Pemula

## ⚠️ Node.js Belum Terinstall

Sistem Anda belum memiliki Node.js. Ikuti langkah berikut:

---

## 📥 **STEP 1: Install Node.js**

### Download Node.js:
1. **Buka browser** (Chrome/Edge/Firefox)
2. **Kunjungi**: https://nodejs.org/
3. **Download versi LTS** (Long Term Support)
   - Klik tombol hijau "**Download Node.js (LTS)**"
   - File size ~30MB
   - Contoh: node-v20.x.x-x64.msi

### Install Node.js:
1. **Klik 2x** file .msi yang didownload
2. **Ikuti instalasi**:
   - Click "Next"
   - Accept License → Click "Next"
   - Destination folder (default OK) → Click "Next"
   - Custom Setup (default OK) → Click "Next"
   - Tools for Native Modules (centang jika ada) → Click "Next"
   - Click "**Install**"
   - Tunggu ~2-3 menit
   - Click "**Finish**"

3. **RESTART PowerShell/Terminal Anda!** ⚠️ PENTING!

### Verify Instalasi:
```powershell
# Buka PowerShell BARU (restart dulu!)
node --version
# Output: v20.x.x

npm --version
# Output: 10.x.x
```

---

## 📱 **STEP 2: Install Expo Go di HP**

Sambil menunggu, install aplikasi di HP Anda:

### Android:
1. Buka **Play Store**
2. Cari "**Expo Go**"
3. Install aplikasi
4. Buka aplikasi (izinkan permissions)

### iOS:
1. Buka **App Store**
2. Cari "**Expo Go**"
3. Install aplikasi
4. Buka aplikasi

---

## 🔧 **STEP 3: Install Dependencies Project**

Setelah Node.js terinstall:

```powershell
# 1. Masuk ke folder mobile-app (PENTING!)
cd C:\BabyGrow\mobile-app

# 2. Verify Anda di folder yang benar
pwd
# Output harus: C:\BabyGrow\mobile-app

# 3. Install dependencies (tunggu 3-5 menit)
npm install

# Jika ada error, coba:
npm install --legacy-peer-deps
```

⚠️ **PENTING:** Pastikan Anda di folder `mobile-app`, bukan di `C:\BabyGrow`!  
Cek dengan `pwd` atau `dir package.json` harus menampilkan file package.json.

**Output yang benar:**
```
added 1234 packages in 2m
```

---

## ▶️ **STEP 4: Jalankan Aplikasi**

```powershell
# Start development server
npm start
```

**Anda akan lihat:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

---

## 📱 **STEP 5: Buka di HP**

### Android:
1. Buka aplikasi **Expo Go**
2. Tab "**Projects**"
3. Tap "**Scan QR Code**"
4. Arahkan camera ke QR code di terminal
5. Tunggu loading (~10-30 detik)
6. **App jalan!** 🎉

### iOS:
1. Buka aplikasi **Camera**
2. Scan QR code
3. Tap notifikasi "Open in Expo Go"
4. Tunggu loading
5. **App jalan!** 🎉

---

## 🎨 **Yang Akan Anda Lihat**

Layar pink dengan:
```
🍼 BabyGrow
Pemantauan Pertumbuhan Balita
Aplikasi AI untuk deteksi risiko stunting
```

---

## 🐛 **Troubleshooting**

### Problem 1: `npm` not recognized
**Cause**: Node.js belum terinstall atau PowerShell belum direstart  
**Solution**: 
- Install Node.js dari https://nodejs.org/
- **RESTART PowerShell** (tutup dan buka lagi)
- Coba lagi `npm --version`

### Problem 2: npm install error
**Solution**:
```powershell
# Hapus node_modules dan coba lagi
Remove-Item -Path node_modules -Recurse -Force
npm install --legacy-peer-deps
```

### Problem 3: Cannot connect to Metro
**Solution**:
```powershell
# Clear cache dan restart
npm start -- --clear
```

### Problem 4: QR code tidak bisa discan
**Solution**:
- Pastikan HP dan PC di WiFi yang sama
- Atau coba tunnel mode:
  ```powershell
  npm start -- --tunnel
  ```

### Problem 5: Port sudah dipakai
**Solution**:
```powershell
# Kill process di port 8081
netstat -ano | findstr :8081
# Catat PID number
taskkill /PID [PID_NUMBER] /F

# Atau ganti port
npm start -- --port 8082
```

---

## 📋 **Checklist Instalasi**

- [ ] Node.js terinstall (v18+)
- [ ] PowerShell sudah direstart
- [ ] `node --version` berfungsi
- [ ] `npm --version` berfungsi
- [ ] Expo Go terinstall di HP
- [ ] `npm install` berhasil (di folder mobile-app)
- [ ] `npm start` berjalan
- [ ] QR code muncul
- [ ] Scan QR dengan Expo Go
- [ ] App terbuka di HP

---

## 🎯 **Quick Commands Reference**

```powershell
# Check Node.js installed
node --version
npm --version

# Navigate to project
cd C:\BabyGrow\mobile-app

# Install dependencies
npm install

# Start development
npm start

# Start with clear cache
npm start -- --clear

# Start with tunnel (if QR doesn't work)
npm start -- --tunnel

# Stop server
Ctrl + C
```

---

## 📞 **Butuh Bantuan?**

### Jika masih error:

1. **Screenshot error message**
2. **Check Node.js version**: `node --version` (harus >= 18)
3. **Check npm version**: `npm --version` (harus >= 9)
4. **Try clean install**:
   ```powershell
   Remove-Item -Path node_modules -Recurse -Force
   Remove-Item -Path package-lock.json -Force
   npm install
   ```

---

## 📚 **Resources**

- **Node.js Download**: https://nodejs.org/
- **Expo Go Android**: https://play.google.com/store/apps/details?id=host.exp.exponent
- **Expo Go iOS**: https://apps.apple.com/app/expo-go/id982107779
- **Expo Docs**: https://docs.expo.dev/

---

## ⏭️ **Setelah Berhasil Running**

Setelah app jalan di HP, Anda bisa:

1. **Edit code** di `App.tsx`
2. **Save** (Ctrl+S)
3. **App otomatis reload** di HP
4. **See changes instantly!** ⚡

---

## 🎓 **Untuk Pembelajaran**

Project ini menggunakan:
- ✅ **Expo** - React Native framework
- ✅ **TypeScript** - Type-safe JavaScript
- ✅ **React Navigation** - Routing
- ✅ **Redux Toolkit** - State management
- ✅ **Expo Go** - Development app

---

**Status Anda Sekarang**: 
- ✅ Node.js: v24.12.0 Installed
- ✅ Expo SDK: 54.0.0 (Latest)
- ⏱️ Next: npm install → npm start

**Setelah Node.js terinstall**:
```powershell
cd C:\BabyGrow\mobile-app
npm install
npm start
```

---

**Good luck! 🚀 Jika ada error, screenshot dan cek troubleshooting di atas!**
