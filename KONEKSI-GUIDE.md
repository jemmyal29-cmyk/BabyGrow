# 📱 BabyGrow - Panduan Koneksi Expo Go

## 🔍 **INFORMASI KONEKSI ANDA**

### ✅ **IP Address PC:**
```
10.110.112.245
```

### ✅ **URL Expo (LAN):**
```
exp://10.110.112.245:8081
```

### ✅ **URL Expo (Tunnel):**
```
exp://rjdd0nk-anonymous-8081.exp.direct
```

---

## 📡 **CARA KONEKSI - 2 MODE**

### **MODE 1: LAN (WiFi Sama) ⚡ RECOMMENDED**

**Syarat:**
- ✅ HP dan PC harus di WiFi yang **SAMA**
- ✅ Jaringan: `10.110.112.x`

**Cara:**
```powershell
cd C:\BabyGrow
.\START-APP.ps1
# Pilih: 1
```

**Atau manual:**
```powershell
cd C:\BabyGrow\mobile-app
npm start
```

**Kelebihan:**
- ⚡ Super cepat
- 🔒 Lebih stabil
- 💾 Hemat data

---

### **MODE 2: Tunnel (WiFi Beda) 🌐**

**Syarat:**
- ✅ PC dan HP boleh WiFi berbeda
- ✅ Bisa pakai data seluler
- ✅ Perlu koneksi internet

**Cara:**
```powershell
cd C:\BabyGrow
.\START-APP.ps1
# Pilih: 2
```

**Atau manual:**
```powershell
cd C:\BabyGrow\mobile-app
npm start -- --tunnel
```

**Kelebihan:**
- 🌐 Bebas WiFi manapun
- 📱 Bisa pakai data seluler
- 🌍 Bisa akses dari luar

---

## 🔧 **TROUBLESHOOTING KONEKSI**

### ❌ **Problem: "Unable to connect"**

**Solusi 1: Cek WiFi**
```powershell
# Cek IP PC
ipconfig

# Pastikan ada:
# IPv4 Address. . . . . . : 10.110.112.245
```

**Solusi 2: Restart Server**
```powershell
# Stop semua node
taskkill /F /IM node.exe

# Start lagi
cd C:\BabyGrow\mobile-app
npm start
```

**Solusi 3: Clear Cache**
```powershell
npm start -- --clear
```

**Solusi 4: Gunakan Tunnel**
```powershell
npm start -- --tunnel
```

---

### ❌ **Problem: QR Code Error**

**Solusi:**
1. **Ketik manual di Expo Go:**
   ```
   exp://10.110.112.245:8081
   ```

2. **Atau gunakan tunnel URL:**
   ```
   exp://rjdd0nk-anonymous-8081.exp.direct
   ```

---

### ❌ **Problem: "Network response timed out"**

**Solusi:**
```powershell
# Check Firewall
# Windows Firewall → Allow app:
# - Node.js
# - Expo CLI

# Atau temporary disable firewall
```

---

## 📱 **CARA KONEKSI DI EXPO GO**

### **Method 1: Scan QR**
1. Buka **Expo Go**
2. Tap "Scan QR Code"
3. Scan QR di terminal
4. Tunggu loading
5. Done! ✅

### **Method 2: Manual Input**
1. Buka **Expo Go**
2. Tap "Enter URL manually"
3. Ketik: `exp://10.110.112.245:8081`
4. Tap "Connect"
5. Done! ✅

### **Method 3: History (Setelah Connect 1x)**
1. Buka **Expo Go**
2. Tab "Recently opened"
3. Tap "BabyGrow"
4. Done! ✅

---

## 🌐 **CEK KONEKSI NETWORK**

### **Cek IP PC:**
```powershell
ipconfig
```

### **Cek IP HP:**
Settings → WiFi → Connected Network → IP Address

### **Pastikan:**
- ✅ PC IP: `10.110.112.x`
- ✅ HP IP: `10.110.112.x`
- ✅ Subnet sama: `255.255.255.0`

---

## ⚡ **QUICK START COMMANDS**

### **Start Normal (LAN):**
```powershell
cd C:\BabyGrow\mobile-app
npm start
```

### **Start Tunnel (Internet):**
```powershell
cd C:\BabyGrow\mobile-app
npm start -- --tunnel
```

### **Start dengan Clear Cache:**
```powershell
npm start -- --clear
```

### **Stop Server:**
```powershell
Ctrl + C
```

### **Kill All Node:**
```powershell
taskkill /F /IM node.exe
```

---

## 📊 **STATUS SERVER**

✅ **Server Running:**
- QR code muncul
- "Metro waiting on exp://..."
- Tidak ada error merah

❌ **Server Error:**
- "Port already in use" → Kill node dan restart
- "ENOENT package.json" → Salah folder (harus di mobile-app)
- "Network error" → Cek WiFi/Firewall

---

## 💡 **TIPS KONEKSI**

1. **Gunakan LAN Mode** jika WiFi sama (lebih cepat)
2. **Gunakan Tunnel Mode** jika WiFi beda (lebih fleksibel)
3. **Simpan URL** di Expo Go untuk akses cepat
4. **Restart server** jika ada masalah
5. **Clear cache** jika app tidak update

---

## 🆘 **BANTUAN CEPAT**

### **Server tidak mau start:**
```powershell
taskkill /F /IM node.exe
cd C:\BabyGrow\mobile-app
npm start
```

### **HP tidak bisa connect:**
```powershell
# Gunakan tunnel
npm start -- --tunnel
```

### **App tidak update:**
```powershell
# Clear cache
npm start -- --clear
# Atau tekan R di terminal
```

---

## 📞 **CONTACT INFO**

**Current Connection:**
- **PC IP:** 10.110.112.245
- **Mode:** LAN
- **Port:** 8081
- **URL:** exp://10.110.112.245:8081

**Tunnel (Backup):**
- **URL:** exp://rjdd0nk-anonymous-8081.exp.direct

---

**Status:** ✅ Server Ready  
**Last Updated:** 2026-01-23
