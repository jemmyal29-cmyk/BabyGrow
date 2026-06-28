# 🐛 ESP32 BLE Troubleshooting Guide

## 🚨 Most Common Issues & Solutions

---

## Issue #1: ESP32 tidak terdeteksi di Arduino IDE

### ❌ Error Message:
```
Board at COM3 is not responding
No board selected
```

### ✅ Solutions:

#### Solution 1A: Check USB Cable
- **Problem:** Cable hanya support charging, bukan data transfer
- **Fix:** 
  - Gunakan cable yang bisa transfer data (lebih tebal)
  - Coba USB port lain di laptop
  - Test dengan device lain untuk verify cable

#### Solution 1B: Install Driver
- **Problem:** Windows tidak recognize ESP32
- **Fix:**
  1. Download driver: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
  2. Extract file
  3. Run installer untuk Windows
  4. Restart laptop
  5. Reconnect ESP32

#### Solution 1C: Check Device Manager
- **Action:**
  1. Plugging ESP32 ke USB
  2. Buka Device Manager (Win + X → Device Manager)
  3. Expand "Ports (COM & LPT)"
  4. Cari "Silicon Labs CP210x" atau "USB-to-UART"
  5. Catat COM port number (misalnya: COM5)
  6. Di Arduino IDE: Tools → Port → Select COM port

#### Solution 1D: Reset ESP32
- **Action:**
  1. Disconnect USB
  2. Wait 2 detik
  3. Reconnect USB
  4. Atau tekan tombol RESET di ESP32 board

#### Solution 1E: Try Different USB Port
- **Action:**
  1. Disconnect ESP32
  2. Connect ke USB port berbeda (belakang tower/hub)
  3. Check Device Manager lagi
  4. Di Arduino IDE: Select port baru

---

## Issue #2: Upload failed / Compilation error

### ❌ Error Messages:
```
esptool.py: error: Failed to connect to ESP32
Timed out waiting for packet header
Board at COM3 is not responding
```

### ✅ Solutions:

#### Solution 2A: COM Port Setting
```
Verify:
Tools → Port → [Check if selected]
```
- **Fix:** 
  1. Harus ada ✓ di sebelah port yang dipilih
  2. Jika tidak ada, klik untuk select

#### Solution 2B: Board Selection
```
Verify:
Tools → Board → [Should show "ESP32 Dev Module"]
```
- **Fix:**
  1. Jika tidak terlihat, buka Board Manager
  2. Search "esp32"
  3. Klik Install by Espressif Systems
  4. Tunggu selesai
  5. Select board lagi

#### Solution 2C: Upload Speed
```
Verify:
Tools → Upload Speed → [Should be "115200"]
```
- **Fix:**
  1. Jika berbeda, ubah ke 115200
  2. Coba upload lagi

#### Solution 2D: Timing Issue
- **Problem:** Laptop tidak sempat detect ESP32
- **Fix:**
  1. Disconnect ESP32
  2. Click "Upload" di Arduino IDE (akan wait)
  3. Dalam 8 detik, connect ESP32
  4. Tunggu upload selesai

#### Solution 2E: Port sudah digunakan
- **Problem:** Serial Monitor atau aplikasi lain buka port
- **Fix:**
  1. Close Serial Monitor (Arduino IDE)
  2. Close aplikasi lain yang pakai COM port
  3. Coba upload lagi

#### Solution 2F: Partition Size
```
Tools → Partition Scheme → [Select "Default"]
```

---

## Issue #3: Serial Monitor kosong / tidak ada output

### ❌ Symptoms:
```
Serial Monitor terbuka tapi tidak ada output sama sekali
Atau output sampah/tidak readable
```

### ✅ Solutions:

#### Solution 3A: Baud Rate (PALING SERING!)
```
Serial Monitor: [Kanan bawah] → Select "115200"
```
- **Penjelasan:** 
  - Kode ESP32 send data di 115200 baud
  - Jika monitor set ke 9600 atau 74880 → output jadi sampah
  - **CRITICAL:** Harus match!

- **Fix:**
  1. Buka Serial Monitor (Ctrl + Shift + M)
  2. Lihat dropdown di kanan bawah
  3. Pilih "115200" (harus exactly)
  4. Lihat output seharusnya clear

#### Solution 3B: No Output After Upload
- **Problem:** Upload berhasil tapi tidak ada output
- **Fix:**
  1. Reset ESP32 (tekan RESET button)
  2. Atau disconnect & reconnect USB
  3. Tunggu 2 detik
  4. Seharusnya output muncul

#### Solution 3C: Partial/Corrupt Output
- **Problem:** Output ada tapi corrupted/random characters
- **Fix:**
  1. Close Serial Monitor
  2. Reset ESP32
  3. Open Serial Monitor lagi
  4. Verify baud rate lagi

#### Solution 3D: USB Port Problem
- **Problem:** COM port terbuka tapi tidak ada data
- **Fix:**
  1. Coba port USB lain
  2. Coba cable lain
  3. Install driver lagi (CP210x)

#### Solution 3E: ESP32 Firmware Corrupted
- **Problem:** Masih tidak ada output setelah semua dicoba
- **Fix:**
  1. Download "ESP32 flash tool"
  2. Erase semua memory
  3. Flash kode lagi
  4. (Advanced option)

---

## Issue #4: BLE Device tidak muncul di HP scan

### ❌ Symptoms:
```
Serial Monitor ESP32 shows "BLE Server Ready"
Tapi di HP Android, ketika scan tidak ada "BabyGrow_Alat"
```

### ✅ Solutions:

#### Solution 4A: Verify ESP32 Output
- **First check:**
  ```
  Di Serial Monitor harusnya muncul:
  ✅ BLE Server Ready!
  Device Name: BabyGrow_Alat
  Service UUID: 0000fff0...
  Waiting for mobile app...
  ```
- **If tidak ada output:**
  1. Re-upload kode
  2. Reset ESP32

#### Solution 4B: Bluetooth HP aktif?
```
HP Android Settings:
Settings → Bluetooth → [Toggle ON]
```
- **Fix:**
  1. Ensure Bluetooth ON
  2. If on, toggle OFF → wait 2 sec → toggle ON

#### Solution 4C: Range/Distance
- **Problem:** HP terlalu jauh dari ESP32
- **Fix:**
  1. Dekatkan HP ke ESP32 (<2 meter)
  2. Tidak ada obstacles di antara
  3. Coba scan lagi

#### Solution 4D: BLE Permissions HP
```
HP Android Settings:
Settings → Apps → BabyGrow → Permissions
→ Ensure: Location, Bluetooth all ON
```
- **Fix:**
  1. Enable Location permission (BLE needs this)
  2. Enable Bluetooth permission
  3. Force close app
  4. Open app lagi

#### Solution 4E: Other Apps Blocking BLE
- **Problem:** Aplikasi lain menggunakan Bluetooth
- **Fix:**
  1. Close/uninstall apps yang pakai BLE (fitness trackers, etc)
  2. Restart HP
  3. Try scan lagi

#### Solution 4F: ESP32 Power Issue
- **Problem:** ESP32 undervolted, BLE tidak stabil
- **Fix:**
  1. Use quality USB cable (tebal/berbulu)
  2. Hubungkan ke laptop port (bukan hub)
  3. Check power LED di ESP32 terang?

---

## Issue #5: Device found tapi connect failed

### ❌ Error Messages:
```
"Connection Failed"
"Connection timeout"
"Pairing failed"
```

### ✅ Solutions:

#### Solution 5A: Try again
- **Sometimes terjadi temporary issue**
- **Fix:**
  1. Disconnect
  2. Scan lagi
  3. Try connect lagi

#### Solution 5B: Reset ESP32
- **Fix:**
  1. Tekan tombol RESET di board
  2. Wait 2 detik
  3. Di HP, try connect lagi

#### Solution 5C: Restart Bluetooth HP
```
HP Settings → Bluetooth → Toggle OFF
[Wait 5 detik]
Bluetooth → Toggle ON
```

#### Solution 5D: Forget Device
```
HP Settings → Bluetooth → Paired Devices
→ Find "BabyGrow_Alat"
→ Tap → "Forget"
```
- **Fix:**
  1. Forget device
  2. Scan lagi
  3. Connect lagi (fresh pairing)

#### Solution 5E: Reinstall App
```
Long press BabyGrow app → Uninstall
Play Store → Search BabyGrow → Install lagi
```

#### Solution 5F: Check Serial Monitor
- **Action:**
  ```
  Setiap kali coba connect dari HP:
  Lihat Serial Monitor ESP32 di laptop
  ```
- **Harusnya muncul:**
  ```
  ✅ Device Connected!
  ```
- **Jika tidak:**
  1. Ada problem di app side
  2. Re-upload firmware

---

## Issue #6: Device connected tapi data tidak transfer

### ❌ Symptoms:
```
Di app status: "Connected"
Tapi Height/Weight tidak update
Serial Monitor ESP32 tidak show data
```

### ✅ Solutions:

#### Solution 6A: Check Serial Monitor Output
```
Lihat ESP32 Serial Monitor:
Seharusnya muncul:
  📏 Height: 78.5 cm
  ⚖️ Weight: 10.25 kg
  🔋 Battery: 87%
```
- **If tidak ada output:**
  1. Loop() function tidak berjalan dengan baik
  2. Check ESP32 board, ada error?
  3. Re-upload firmware

#### Solution 6B: Characteristic Notify
- **Problem:** App tidak register untuk menerima notifications
- **Fix di app:**
  1. BLEService harus enable "startNotification"
  2. Pastikan karakteristik punya NOTIFY property
  3. Codenya sudah ada di BLEService.ts

#### Solution 6C: UUID Mismatch
- **Problem:** UUIDs di ESP32 ≠ UUIDs di app
- **Fix:**
  1. Check ESP32 kode:
     ```
     #define SERVICE_UUID "0000fff0-0000-1000-8000-00805f9b34fb"
     #define HEIGHT_CHAR_UUID "0000fff1-0000-1000-8000-00805f9b34fb"
     #define WEIGHT_CHAR_UUID "0000fff2-0000-1000-8000-00805f9b34fb"
     ```
  2. Check BLEService.ts di app (harus sama)
  3. Jika beda, update salah satu

#### Solution 6D: App masih Mock Mode
- **Problem:** App running di Expo Go (mock mode only)
- **Note:**
  ```
  Expo Go = Mock mode only
  BLE real hanya work di:
    - Custom dev client
    - Standalone APK
  ```
- **Fix:**
  1. For now, fine dengan data simulasi
  2. Later: build custom APK untuk real BLE

---

## Issue #7: Data berfluktuasi/tidak stabil

### ❌ Symptoms:
```
Value terus berubah drastis
Atau data hilang-hilang
Atau disconnect tiba-tiba
```

### ✅ Solutions:

#### Solution 7A: Signal Quality
- **Problem:** BLE signal lemah
- **Fix:**
  1. Dekatkan HP ke ESP32 (<1 meter)
  2. Remove obstacles (metal, water)
  3. Try at different location

#### Solution 7B: Antenna Quality
- **Problem:** ESP32 antenna signal rendah
- **Fix:**
  1. Check antenna connection di ESP32
  2. Jika tidak ada antenna, signal = weak
  3. Optional: add external antenna

#### Solution 7C: Interference
- **Problem:** 2.4GHz frequency interference (WiFi, microwave)
- **Fix:**
  1. Move away dari WiFi router
  2. Avoid microwave
  3. Try in different room

#### Solution 7D: Update Rate Too Fast
- **Problem:** Data update terlalu cepat
- **Fix di ESP32:**
  ```cpp
  const unsigned long SENSOR_UPDATE_INTERVAL = 1000; // 1 second
  // Ubah ke 2000 untuk 2 second interval
  ```

#### Solution 7E: Phone Bluetooth Weak
- **Problem:** HP Bluetooth chipset tidak bagus
- **Fix:**
  1. Restart HP
  2. Forget & re-pair device
  3. Update phone software
  4. Try dengan HP lain untuk compare

---

## Quick Diagnostic Flow

Gunakan flow ini ketika ada problem:

```
START
  ↓
[Cek Arduino IDE Port Setting]
  Salah? → Fix port, go to UPLOAD
  Benar? ↓
[Cek Baud Rate (harus 115200)]
  Salah? → Fix baud, go to SERIAL MONITOR
  Benar? ↓
[Cek Serial Monitor Output]
  Kosong? → Re-upload firmware, check USB cable
  Corrupted? → Wrong baud rate, fix it
  "BLE Server Ready"? ↓
[Cek HP Bluetooth - Aktif?]
  Tidak? → Turn on Bluetooth
  Ya? ↓
[Cek Device Scan - Ada "BabyGrow_Alat"?]
  Tidak? → Dekat HP ke ESP32, restart BLE
  Ya? ↓
[Cek Connect - Berhasil?]
  Tidak? → Forget device, re-pair
  Ya? ↓
[Cek Data Transfer - Ada output di Serial Monitor?]
  Tidak? → Check Characteristic UUIDs match
  Ya? ↓
[Cek Data di App - Muncul value?]
  Tidak? → App might be in mock mode (need custom build)
  Ya? ↓
✅ SUCCESS!
```

---

## 📞 When to Seek Help

Jika sudah dicoba semua di atas dan masih tidak work:

1. **Take a screenshot:**
   - Serial Monitor ESP32 output
   - Arduino IDE Tools menu settings
   - Device Manager COM port

2. **Note the error:**
   - Exact error message
   - When it happens

3. **Info yang diperlukan:**
   - ESP32 type (DevKit? NodeMCU?)
   - Windows version
   - Arduino IDE version
   - USB cable type
   - What was last working step?

---

## 🎓 Quick Reference

### Common Commands

**Terminal:**
```bash
# Check COM ports
mode COM
```

**Arduino IDE Serial Monitor Shortcuts:**
- Ctrl + Shift + M → Open Serial Monitor
- Auto-scroll: checkbox
- Newline: dropdown (NL, CR, NL+CR)
- Baud rate: dropdown

**ESP32 Physical:**
- RESET button = restart ESP32
- BOOT button = hold untuk flash mode (usually not needed)

---

**If still stuck, check:**
- ESP32_SETUP_GUIDE.md (full detailed guide)
- ESP32_BLE_Firmware.ino (code documentation)
- BLE_CONNECTION_CHECKLIST.md (step-by-step verification)

Good luck! 🚀
