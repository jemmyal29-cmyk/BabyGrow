# 📋 BLE Connection Checklist

## ✅ APP SIDE (Mobile)
- [x] React Native app running ✅
- [x] BLEService implemented ✅
- [x] Mock mode working (Expo Go) ✅
- [x] Real mode architecture ready ✅
- [x] PairingModal working ✅
- [x] Android permissions configured ✅
- [x] Can scan for BLE devices (will work when ESP32 advertising) ✅
- [x] Can connect to BLE devices (will work with ESP32) ✅

---

## ⚙️ ESP32 FIRMWARE (NEW!)
- [ ] Arduino IDE installed
  - Download: https://www.arduino.cc/en/software
  - Action: Download & install

- [ ] ESP32 board support added
  - File → Preferences → Additional Board URLs
  - Add: https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
  - Action: Tools → Board Manager → Install "esp32 by Espressif Systems"

- [ ] USB driver installed
  - Action: Device Manager check or download from silabs.com

- [ ] ESP32 connected to laptop
  - Via USB cable (data cable, bukan power only)
  - Action: Connect & check COM port di Device Manager

- [ ] Kode firmware ada
  - File: ESP32_BLE_Firmware.ino ✅
  - Location: c:\BabyGrow\ESP32_BLE_Firmware.ino

- [ ] Kode disiapkan di Arduino IDE
  - File → Open → ESP32_BLE_Firmware.ino
  - Verify no errors (Ctrl + R)
  - Action: Open file

- [ ] Board settings correct
  - Tools → Board: ESP32 Dev Module
  - Tools → Upload Speed: 115200
  - Tools → Port: COM3 (atau sesuai device)
  - Action: Set all 3 settings

- [ ] Kode diupload ke ESP32
  - Sketch → Upload (atau Ctrl + U)
  - Wait untuk "✅ Done uploading"
  - Action: Upload kode

- [ ] Serial Monitor menunjukkan BLE ready
  - Tools → Serial Monitor (Ctrl + Shift + M)
  - Baud Rate: 115200
  - Check output: "✅ BLE Server Ready!"
  - Action: Verify output

---

## 🔌 HARDWARE CONNECTION
- [ ] ESP32 powered on
  - USB cable connected → ESP32 mendapat power
  - Action: Check LED indikator

- [ ] BLE advertising active
  - Serial Monitor shows startup messages
  - Device name: "BabyGrow_Alat"
  - Action: Verify di Serial Monitor

- [ ] HP Android siap
  - Bluetooth turned ON
  - WiFi tidak perlu (BLE ≠ WiFi)
  - BabyGrow app installed
  - Action: Verify settings

---

## 📱 TESTING FLOW

### Step 1: Verify ESP32
```
✅ Serial Monitor shows:
  🔧 Initializing BLE...
  📡 Creating BLE Server...
  ✅ BLE Server Ready!
  Device Name: BabyGrow_Alat
```
- [ ] ESP32 mengeluarkan output di Serial Monitor

### Step 2: Scan dari HP
```
Buka BabyGrow App → Ukur Otomatis → Pair dengan Alat Baru
Tunggu 5 detik untuk scan selesai
```
- [ ] "BabyGrow_Alat" muncul di list

### Step 3: Connect dari HP
```
Tap "BabyGrow_Alat" untuk connect
Tunggu 2-3 detik
```
- [ ] Status berubah jadi "Connected"
- [ ] Serial Monitor ESP32 shows: "✅ Device Connected!"

### Step 4: Verify Data Transfer
```
Di Serial Monitor ESP32, harusnya muncul:
  📏 Height: 78.5 cm
  ⚖️ Weight: 10.25 kg
  🔋 Battery: 87%
  (setiap detik update)
```
- [ ] Data streaming terlihat di Serial Monitor

### Step 5: Verify Di App
```
Di HP Android BabyGrow app:
  Height: 78.5 cm ✅
  Weight: 10.25 kg ✅
  Battery: 87% ✅
```
- [ ] Semua nilai muncul di app

### Step 6: Test Disconnect
```
Di app → Tap "Disconnect"
Atau matikan Bluetooth HP
```
- [ ] Serial Monitor shows: "❌ Device Disconnected!"
- [ ] App menunjukkan "Not Connected"

---

## 🎯 Apa Yang Terjadi Jika Berhasil

### Di Serial Monitor ESP32:
```
✅ Device Connected!
📱 Mobile app terhubung ke ESP32
📏 Height: 78.5 cm
⚖️ Weight: 10.25 kg
🔋 Battery: 87%
📏 Height: 78.4 cm
⚖️ Weight: 10.26 kg
...
(terus update setiap 1 detik)
```

### Di HP Android (BabyGrow App):
```
Status: Connected ✅

Pengukuran Terbaru:
- Tinggi: 78.5 cm
- Berat: 10.25 kg
- Baterai: 87%
- Kualitas: Sangat Baik

[Data akan update real-time setiap detik]
```

---

## 🔧 Troubleshooting Checklist

### Arduino IDE tidak bisa detect ESP32
- [ ] USB cable dihubungkan? (bukan power only)
- [ ] Driver installed? (Device Manager check)
- [ ] COM port setting correct? (Tools → Port)
- [ ] ESP32 button RESET ditekan? (reset board)

### Upload failed / "Port COM not found"
- [ ] Disconnect & reconnect USB
- [ ] Close Arduino IDE, open lagi
- [ ] Check Device Manager untuk COM port
- [ ] Coba USB port lain
- [ ] ESP32 bisa dilihat di Device Manager?

### Serial Monitor kosong / tidak ada output
- [ ] Baud Rate set ke 115200? (critical!)
- [ ] COM Port correct?
- [ ] USB cable terhubung?
- [ ] Tekan RESET button di ESP32
- [ ] Atau buka Arduino IDE ulang

### BLE device tidak muncul di HP scan
- [ ] Serial Monitor ESP32 menunjukkan "BLE Server Ready"?
  - Jika tidak: re-upload kode
  - Jika ya: lanjut ke step selanjutnya
- [ ] Bluetooth HP aktif?
- [ ] WiFi HP aktif? (tidak perlu, tapi ok)
- [ ] Dekatkan HP ke ESP32 (<2 meter)
- [ ] Coba restart HP Bluetooth (matikan/hidup)

### Connect berhasil tapi data tidak muncul
- [ ] Serial Monitor ESP32 menunjukkan "📏 Height:" updates?
  - Jika tidak: ada bug di kode
  - Jika ya: ada issue di app
- [ ] Disconnect dari app, connect lagi
- [ ] Force close BabyGrow app, open ulang

### Data muncul di Serial Monitor tapi tidak di app
- [ ] App harus dalam "mock mode OFF" atau "real mode"
- [ ] Cek apakah app masih di Expo Go (mock mode)
- [ ] Perlu custom build untuk real BLE support
- [ ] Atau test di mock mode dulu di app

---

## 📊 Status Tracking

**Tanggal Mulai:** ___________

**Progress:**
- [ ] Arduino IDE installed
- [ ] ESP32 board support added
- [ ] Kode uploaded ke ESP32
- [ ] Serial Monitor verified
- [ ] HP terdeteksi device
- [ ] HP berhasil connect
- [ ] Data streaming terlihat
- [ ] ✅ BERHASIL!

**Notes:**
```
_________________________________
_________________________________
_________________________________
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `ESP32_BLE_Firmware.ino` | Arduino kode untuk ESP32 |
| `ESP32_SETUP_GUIDE.md` | Detailed setup guide |
| `ESP32_QUICK_START.md` | Quick reference |
| `BLE_CONNECTION_CHECKLIST.md` | This file |

---

**Next Steps:**
1. Download Arduino IDE
2. Follow ESP32_SETUP_GUIDE.md
3. Upload kode ESP32_BLE_Firmware.ino
4. Test BLE connection
5. ✅ Enjoy real BLE integration!

Good luck! 🚀
