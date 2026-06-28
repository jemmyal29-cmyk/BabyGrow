# 🔧 Panduan Setup ESP32 dengan Arduino IDE

## 📋 Yang Dibutuhkan
- ✅ ESP32 Dev Module atau NodeMCU ESP32 (sudah punya)
- ✅ USB Cable (tipe yang bisa transfer data)
- ✅ Laptop/PC
- ✅ Arduino IDE

---

## ⬇️ STEP 1: Download & Install Arduino IDE

1. **Buka browser**
   - Kunjungi: https://www.arduino.cc/en/software

2. **Download versi terbaru**
   - Windows: `arduino-1.8.x-windows.exe` atau `ArduinoIDE-latest-windows.exe`
   - Size: ~200MB

3. **Install**
   - Double-click file `.exe`
   - Next → Next → Install
   - Tunggu selesai (~5 menit)

4. **Verify**
   - Buka Arduino IDE
   - Seharusnya muncul interface editor

---

## 🔌 STEP 2: Tambah ESP32 Board Support

### Buka Arduino IDE Preferences:

**Windows:**
1. File → Preferences

**Dalam Preferences window:**
2. Cari field: "Additional Board Manager URLs"

3. **Klik tombol icon folder** di sebelah kanan field

4. **Paste URL ini:**
```
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
```

5. **Klik OK** → OK lagi untuk close window

### Install ESP32 Board Package:

6. **Buka Board Manager**
   - Tools → Board → Board Manager

7. **Cari "esp32"**
   - Ketik di search box

8. **Klik hasil "esp32 by Espressif Systems"**

9. **Klik tombol INSTALL**
   - Tunggu download selesai (~200MB, 5-10 menit)

10. **Klik CLOSE** ketika selesai

---

## 🎯 STEP 3: Setup USB Connection

### Connect ESP32 ke Laptop:

1. **Ambil USB Cable** (pastikan bisa transfer data, bukan power only)

2. **Connect ke ESP32:**
   - Port USB (micro atau USB-C) ada di ESP32

3. **Connect ke Laptop:**
   - Hubungkan ke USB port laptop

4. **Check Connection:**
   - Di Windows, check Device Manager
   - Harusnya ada device baru di "COM & LPT Ports"
   - Catat nama COM port (misalnya: COM5, COM3, dll)

**Jika tidak muncul:**
- Download driver: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers
- Install driver
- Disconnect/connect ulang ESP32

---

## 📁 STEP 4: Open Kode Arduino

1. **Download file kode:**
   - File: `ESP32_BLE_Firmware.ino`
   - Location: `c:\BabyGrow\ESP32_BLE_Firmware.ino`

2. **Buka di Arduino IDE:**
   - File → Open
   - Navigate ke: `c:\BabyGrow`
   - Pilih `ESP32_BLE_Firmware.ino`
   - Klik Open

3. **Verify kode compile:**
   - Sketch → Verify/Compile
   - Atau tekan: Ctrl + R

---

## ⚙️ STEP 5: Configure Upload Settings

Sebelum upload, pastikan settings benar:

### Tools Menu:

1. **Board:**
   ```
   Tools → Board → esp32 → "ESP32 Dev Module"
   ```

2. **Upload Speed:**
   ```
   Tools → Upload Speed → "115200"
   ```

3. **COM Port:**
   ```
   Tools → Port → [Pilih COM port ESP32]
   ```
   - Contoh: COM3, COM5, dst

4. **Settings lainnya (default OK):**
   ```
   Flash Mode: DIO
   Partition Scheme: Default (1.3MB APP / 3.4MB SPIFFS)
   Core Debug Level: None
   PSRAM: Disabled
   ```

---

## 🚀 STEP 6: Upload Kode ke ESP32

### Cara 1: Tombol Menu
1. **Sketch → Upload**
2. Atau tekan: **Ctrl + U**

### Cara 2: Tombol Arrow
- Klik tombol panah ke kanan (Upload button) di toolbar

### Proses Upload:
- Status bar akan menunjukkan "Uploading..."
- Tunggu 10-20 detik
- Harusnya muncul **"✅ Done uploading"**

**Jika error:**
- Cek COM port
- Reset ESP32 (tekan tombol RESET di board)
- Coba ulang upload

---

## 📊 STEP 7: Monitor Serial Output

Setelah upload berhasil, buka Serial Monitor:

### Buka Serial Monitor:
1. **Tools → Serial Monitor**
2. Atau tekan: **Ctrl + Shift + M**

### Setup Serial Monitor:
- **Baud Rate:** Set ke **115200** (PENTING!)
- Lihat dropdown di kanan bawah window

### Verifikasi Berhasil:
Harusnya muncul output seperti ini:

```
╔════════════════════════════════════════╗
║    BabyGrow ESP32 BLE Server v1.0    ║
╚════════════════════════════════════════╝

🔧 Initializing BLE...
📡 Creating BLE Server...
📦 Creating BLE Service...
📏 Creating HEIGHT characteristic...
⚖️  Creating WEIGHT characteristic...
🔋 Creating BATTERY characteristic...
🚀 Starting BLE Service...
📢 Setting up BLE Advertising...

╔════════════════════════════════════════╗
║  ✅ BLE Server Ready!                 ║
║                                        ║
║  Device Name: BabyGrow_Alat           ║
║  Service UUID: 0000fff0...            ║
║                                        ║
║  Waiting for mobile app...             ║
╚════════════════════════════════════════╝
```

**Jika tidak ada output:**
- Cek Baud Rate (harus 115200)
- Reset ESP32
- Cek USB connection

---

## 📱 STEP 8: Test dari Mobile App

Setelah ESP32 running:

### Di HP Android dengan BabyGrow App:

1. **Pastikan:**
   - Bluetooth HP dinyalakan
   - WiFi tidak perlu (BLE gunakan protokol berbeda)
   - Dekatkan HP ke ESP32

2. **Buka BabyGrow App**

3. **Tap "Ukur Otomatis"** 

4. **Tap "Pair dengan Alat Baru"**

5. **Tunggu scan selesai** (~5 detik)

6. **Pilih "BabyGrow_Alat"** dari list

7. **Tap untuk connect**

### Di Serial Monitor ESP32:
Harusnya muncul:
```
✅ Device Connected!
📱 Mobile app terhubung ke ESP32
📏 Height: 78.5 cm
⚖️ Weight: 10.25 kg
🔋 Battery: 87%
📏 Height: 78.4 cm
⚖️ Weight: 10.26 kg
...
```

### Di HP Android:
Harusnya muncul:
- Height: 78.5 cm
- Weight: 10.25 kg
- Battery: 87%

---

## ✅ TROUBLESHOOTING

### ❌ Problem: "Board tidak detected"
**Solution:**
- Cek Device Manager di Windows
- Lihat apakah ada COM port baru
- Jika tidak ada, download & install driver:
  https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

### ❌ Problem: "Upload failed - port COM3 not found"
**Solution:**
- Reconnect USB cable
- Buka ulang Arduino IDE
- Verify COM port di Device Manager
- Pilih COM port yang benar di Arduino IDE

### ❌ Problem: "Serial Monitor kosong atau tidak ada output"
**Solution:**
1. Check Baud Rate (harus 115200)
2. Reset ESP32:
   - Tekan tombol RESET di board
   - Atau disconnect/connect USB
3. Check koneksi USB (cable mungkin data only)

### ❌ Problem: "BLE tidak keluar di HP"
**Solution:**
1. Pastikan output di Serial Monitor ada
2. Pastikan Bluetooth HP aktif
3. Dekatkan HP ke ESP32 (<2 meter)
4. Force close app di HP
5. Buka ulang BabyGrow app

### ❌ Problem: "Device Connected tapi data tidak muncul"
**Solution:**
1. Lihat Serial Monitor:
   - Ada output "Height: xx.x cm"?
   - Ada output "Weight: xx.xx kg"?
2. Jika tidak ada:
   - Reconnect dari HP
   - Reset ESP32
   - Check kode tidak error

### ❌ Problem: "Kompilasi error saat verify"
**Solution:**
1. Pastikan board dipilih: ESP32 Dev Module
2. Download ulang file kode
3. Copy-paste kode baru ke Arduino IDE
4. Coba verify lagi

---

## 🎓 Penjelasan Kode

### BLE UUIDs (Universally Unique Identifier):
```cpp
SERVICE_UUID        "0000fff0-0000-1000-8000-00805f9b34fb"
HEIGHT_CHAR_UUID    "0000fff1-0000-1000-8000-00805f9b34fb"
WEIGHT_CHAR_UUID    "0000fff2-0000-1000-8000-00805f9b34fb"
BATTERY_CHAR_UUID   "0000fff3-0000-1000-8000-00805f9b34fb"
```
- Ini harus SAMA dengan di app.
- Kalau beda, phone tidak bisa connect

### Simulated Data (Data Palsu):
```cpp
simulatedHeight = 78.5 + (sin(now / 5000.0) * 0.5);
simulatedWeight = 10.25 + (sin(now / 7000.0 + 1) * 0.3);
```
- Kode ini menggunakan SIMULASI sensor
- Untuk real sensor, ganti dengan sensor code

### BLE Notify vs Read:
- **Notify:** Server push data ke client (HEIGHT, WEIGHT)
- **Read:** Client pull data dari server (BATTERY)

---

## 🔗 Koneksi Real Sensor (Optional)

Kalau mau connect sensor asli (bukan simulasi):

### Sensor Height (Ultrasonic HC-SR04):
```cpp
// Connect ke GPIO pins
#define TRIG_PIN 19
#define ECHO_PIN 18

float readHeight() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  float distance = (duration * 0.034) / 2;
  return distance; // cm
}
```

### Sensor Weight (Load Cell + HX711):
```cpp
#include "HX711.h"

HX711 scale;
scale.begin(14, 13); // DT, SCK pins
float weight = scale.get_units() / 1000.0; // kg
```

---

## 📞 Quick Reference

| Task | Shortcut |
|------|----------|
| Verify (Compile) | Ctrl + R |
| Upload | Ctrl + U |
| Open Serial Monitor | Ctrl + Shift + M |
| New Sketch | Ctrl + N |
| Open Sketch | Ctrl + O |
| Save | Ctrl + S |

---

## ✨ Selesai!

Sekarang ESP32 siap berkomunikasi dengan mobile app via BLE! 🎉

**Jika ada error, hubungi atau check:**
- Serial Monitor output
- COM port connection
- Baud rate (115200)
- Board setting (ESP32 Dev Module)
- USB cable quality

**Happy coding!** 🚀
