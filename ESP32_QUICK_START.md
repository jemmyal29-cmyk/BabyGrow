# ⚡ Quick Start ESP32 (TL;DR)

## 3 Step Cepat:

### 1️⃣ Setup Arduino IDE (5 menit)
```
Download: https://www.arduino.cc/en/software
Install → Finish
```

### 2️⃣ Add ESP32 Support (3 menit)
```
File → Preferences
Additional Board URLs:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Tools → Board Manager
Search: esp32
Install by Espressif Systems
```

### 3️⃣ Upload Kode (2 menit)
```
1. File → Open → c:\BabyGrow\ESP32_BLE_Firmware.ino
2. Tools → Board → ESP32 Dev Module
3. Tools → Upload Speed → 115200
4. Tools → Port → [Pilih COM port]
5. Sketch → Upload (atau Ctrl + U)
```

### ✅ Verify Success
```
Tools → Serial Monitor (Ctrl + Shift + M)
Baud Rate: 115200

Harusnya muncul:
✅ BLE Server Ready!
Device Name: BabyGrow_Alat
```

---

## 📱 Test di HP

1. Buka BabyGrow App
2. Tap "Ukur Otomatis" → "Pair dengan Alat Baru"
3. Cari "BabyGrow_Alat"
4. Tap untuk connect
5. ✅ Data height/weight muncul!

---

## 🔧 Troubleshooting

| Error | Solusi |
|-------|--------|
| "Port COM not found" | Cek Device Manager, install driver |
| "Upload failed" | Reset ESP32, reconnect USB |
| "Serial Monitor kosong" | Cek baud rate (harus 115200) |
| "Device not found" | Dekatkan HP ke ESP32 |

---

**Full Guide:** ESP32_SETUP_GUIDE.md

**File Kode:** ESP32_BLE_Firmware.ino
