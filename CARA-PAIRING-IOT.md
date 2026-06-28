# 🔗 Cara Pairing Alat IoT BabyGrow

## 📱 Panduan Lengkap Pairing Perangkat

---

## 🎯 Apa itu Pairing?

**Pairing** adalah proses menghubungkan smartphone Anda dengan alat ukur IoT BabyGrow (timbangan + pengukur tinggi digital) melalui protokol MQTT/WiFi atau BLE (Bluetooth Low Energy).

**Setelah pairing berhasil**, data pengukuran (tinggi & berat) akan otomatis muncul di dashboard secara real-time.

---

## 📋 Persiapan Sebelum Pairing

### ✅ Checklist Hardware (Jika Pakai ESP32 Real)

1. **Alat IoT BabyGrow** sudah dinyalakan
2. **WiFi** sudah terkoneksi (untuk mode MQTT)
3. **Bluetooth** smartphone aktif (untuk mode BLE)
4. **Jarak** maksimal 10 meter (untuk BLE)
5. **Baterai** alat minimal 20%

### ✅ Checklist Software

1. App BabyGrow sudah terinstall
2. Sudah login ke akun Anda
3. Berada di **Dashboard** (Home screen)
4. Internet aktif (untuk MQTT mode)

---

## 🚀 Cara Pairing - Step by Step

### **STEP 1: Buka Dashboard** 📊

Setelah login, Anda akan berada di **User Dashboard Screen**.

**Tampilan awal:**
```
┌─────────────────────────────────────────┐
│  👋 Selamat Datang, [Nama User]!        │
│                                          │
│  📊 Quick Stats                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ 2 Anak   │  │ 45 Ukur  │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  📈 Live Measurement                     │
│  ┌────────────────────────────────────┐ │
│  │ ⚠️ Belum ada data sensor           │ │
│  │                                    │ │
│  │ Klik "Ukur Otomatis" untuk        │ │
│  │ menghubungkan perangkat            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  🎯 Quick Actions                        │
│  ┌───────────────────────────────────┐  │
│  │  [🔗 Ukur Otomatis]  NEW          │  │ ← KLIK INI!
│  └───────────────────────────────────┘  │
│  ┌───────────────┐  ┌─────────────────┐ │
│  │ ✍️ Ukur Manual│  │ 📊 Lihat Grafik│ │
│  └───────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
```

**Cari tombol:** **"🔗 Ukur Otomatis"** dengan badge **NEW** berwarna merah.

---

### **STEP 2: Klik Tombol "Ukur Otomatis"** 🖱️

**Lokasi tombol:**
- Di bagian **Quick Actions**
- Card berwarna **gradient pink** (Hot Pink → Light Salmon)
- Icon: 🔗 (link/chain)
- Text: "Ukur Otomatis"
- Badge: **NEW** (merah)

**Saat diklik:**
- Haptic feedback (getaran ringan) ✅
- Pairing Modal akan muncul 🎉

---

### **STEP 3: Pairing Modal - Connecting** ⏳

Modal pairing akan muncul dengan status **"Menghubungkan..."**

```
╔═══════════════════════════════════════╗
║     Pairing IoT Device                ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│                                     │
│         ⏳ Menghubungkan...         │
│                                     │
│     [Animasi Pulse Ring]            │
│     [Rotating Gradient Circle]      │
│                                     │
│  Broker: broker.emqx.io:1883        │
│  Status: Connecting...              │
│                                     │
│  • Mencari perangkat...             │
│  • Membangun koneksi MQTT...        │
│  • Melakukan handshake...           │
│                                     │
└─────────────────────────────────────┘

           [Batal]
```

**Yang terjadi di background:**
1. MQTTService mencoba connect ke broker
2. Subscribe ke topic `babygrow/data/sensor`
3. Menunggu device response (2-5 detik)

**Animasi:**
- Pulse ring effect (expand/shrink)
- Rotating gradient border
- Progress indicator

---

### **STEP 4: Pairing Success** ✅

Jika koneksi berhasil, modal berubah menjadi **Success State**:

```
╔═══════════════════════════════════════╗
║     Pairing IoT Device                ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│                                     │
│         ✅ Terhubung!               │
│                                     │
│     [Animasi Check Mark]            │
│     [Green Glow Effect]             │
│                                     │
│  Device ID: ESP32_VL53L0X_001      │
│  Broker: broker.emqx.io             │
│  IP Address: 192.168.1.42           │
│  Status: 🟢 Online                  │
│                                     │
│  Pengukuran otomatis dimulai!       │
│                                     │
└─────────────────────────────────────┘

  (Auto-close dalam 2.5 detik...)
```

**Yang terjadi:**
- ✅ Haptic success feedback (double tap)
- ✅ Success animation (scale + fade)
- ✅ Auto-close setelah 2.5 detik
- ✅ Mock sensor data mulai streaming (jika di mode demo)
- ✅ Dashboard update dengan data real-time

---

### **STEP 5: Dashboard Dengan Data Real-Time** 📡

Setelah modal close, dashboard otomatis update:

```
┌─────────────────────────────────────────┐
│  👋 Selamat Datang, [Nama User]!        │
│                                          │
│  📊 Quick Stats                          │
│  ┌──────────┐  ┌──────────┐             │
│  │ 2 Anak   │  │ 45 Ukur  │             │
│  └──────────┘  └──────────┘             │
│                                          │
│  📈 Live Measurement   🟢 Online        │ ← STATUS BERUBAH
│  ┌────────────────────────────────────┐ │
│  │  Height: 78.3 cm                  │ │ ← DATA MUNCUL!
│  │  Weight: 10.2 kg                  │ │
│  │                                    │ │
│  │  🟢 Online                         │ │
│  │  Last update: baru saja            │ │
│  └────────────────────────────────────┘ │
│                                          │
│  🔧 Hardware Health   [Floating]        │
│  ┌────────────────────────────────────┐ │
│  │  🟢 Connected                      │ │ ← WIDGET MUNCUL
│  │  🔋 87%                            │ │
│  │  📶 -45 dBm                        │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Yang berubah:**
- ✅ Live Measurement card menampilkan data
- ✅ Status: 🟢 Online (hijau)
- ✅ Hardware Health widget muncul (floating)
- ✅ Data update setiap 3 detik

---

### **STEP 6: Data Real-Time Streaming** 📊

**Setelah pairing**, data akan update secara otomatis:

**Update setiap 3 detik:**
```
10:00:00 → Height: 78.3 cm | Weight: 10.2 kg
10:00:03 → Height: 79.1 cm | Weight: 10.4 kg ← UPDATE!
10:00:06 → Height: 77.8 cm | Weight: 10.1 kg ← UPDATE!
10:00:09 → Height: 78.5 cm | Weight: 10.3 kg ← UPDATE!
```

**Animasi update:**
- Smooth fade transition
- Number counter animation
- Timestamp "baru saja" / "5 detik lalu"
- Hardware health update (battery, signal)

---

## ❌ Pairing Error - Troubleshooting

### **Error State: Connection Failed**

Jika koneksi gagal, modal akan menampilkan:

```
╔═══════════════════════════════════════╗
║     Pairing IoT Device                ║
╚═══════════════════════════════════════╝

┌─────────────────────────────────────┐
│                                     │
│         ⚠️ Koneksi Gagal           │
│                                     │
│     [Animasi Warning Icon]          │
│     [Shake Animation]               │
│                                     │
│  Tidak dapat terhubung ke device    │
│                                     │
│  Kemungkinan penyebab:              │
│  • Device tidak dinyalakan          │
│  • WiFi/Bluetooth tidak aktif       │
│  • Jarak terlalu jauh               │
│  • Broker MQTT offline              │
│                                     │
└─────────────────────────────────────┘

       [Coba Lagi]    [Tutup]
```

**Solusi:**
1. **Periksa Hardware**
   - Pastikan alat IoT menyala
   - LED indicator hijau/biru
   - Jarak < 10 meter (BLE) atau WiFi tersambung (MQTT)

2. **Periksa Koneksi**
   - WiFi smartphone aktif
   - Internet stabil
   - Bluetooth ON (untuk BLE mode)

3. **Restart**
   - Matikan & nyalakan alat IoT
   - Restart app BabyGrow
   - Coba pairing ulang

---

## 🔄 Re-Pairing (Connect Ulang)

### **Skenario 1: Device Disconnect**

Jika device terputus (mati baterai, keluar jangkauan, dll):

**Dashboard akan menampilkan:**
```
┌────────────────────────────────────┐
│  📈 Live Measurement   🔴 Offline  │ ← STATUS MERAH
│  ┌────────────────────────────────┐│
│  │  Height: 78.3 cm               ││
│  │  Weight: 10.2 kg               ││
│  │                                ││
│  │  🔴 Offline                    ││ ← WARNING
│  │  Last update: 2 menit lalu     ││
│  │                                ││
│  │  [🔗 Hubungkan Ulang]          ││ ← TOMBOL MUNCUL
│  └────────────────────────────────┘│
└────────────────────────────────────┘
```

**Cara reconnect:**
1. Klik tombol **"Hubungkan Ulang"**
2. Pairing modal muncul lagi
3. Tunggu proses connect
4. Success → Data streaming lagi

### **Skenario 2: Manual Disconnect**

Untuk disconnect manual (hemat baterai):

**Option 1: Via Hardware Health Widget**
```
┌────────────────────────────────────┐
│  🔧 Hardware Health                │
│  🟢 Connected                      │
│  🔋 87%                            │
│  📶 -45 dBm                        │
│                                    │
│  [⏸️ Pause]  [❌ Disconnect]      │ ← KLIK DISCONNECT
└────────────────────────────────────┘
```

**Option 2: Via Profile → IoT Devices**
```
Settings → IoT Devices → [Device Name] → [Disconnect]
```

---

## 🛠️ Mode Pairing

### **Mode 1: MQTT (WiFi) - Recommended** 🌐

**Untuk:**
- Jarak jauh (selama WiFi terhubung)
- Monitoring dari mana saja
- Real ESP32 device dengan WiFi

**Cara:**
1. Pastikan ESP32 terhubung ke WiFi yang sama
2. App otomatis connect ke broker MQTT
3. Subscribe ke topic device
4. Data streaming via internet

**Kelebihan:**
- ✅ Range unlimited (via internet)
- ✅ Monitoring remote
- ✅ Data logging ke cloud

**Kekurangan:**
- ❌ Perlu WiFi/Internet
- ❌ Latency sedikit lebih tinggi

---

### **Mode 2: BLE (Bluetooth Low Energy)** 📡

**Untuk:**
- Direct connection smartphone ↔ device
- Tanpa internet
- Range pendek (< 10 meter)

**Cara:**
1. Aktifkan Bluetooth smartphone
2. App scan BLE devices
3. Pair dengan device "BabyGrow-XXXX"
4. Data streaming via BLE

**Kelebihan:**
- ✅ Tidak perlu internet
- ✅ Latency rendah
- ✅ Hemat power

**Kekurangan:**
- ❌ Range terbatas (10 meter)
- ❌ Tidak bisa monitoring remote

---

## 📱 Demo Mode (Mock Sensor)

### **Saat Ini: Mode Demo Aktif**

App BabyGrow saat ini berjalan dalam **DEMO MODE** dengan mock sensor:

**Karakteristik:**
- ✅ Tidak perlu hardware real
- ✅ Data simulasi realistis (75-85 cm, 9.5-11 kg)
- ✅ Update setiap 3 detik
- ✅ Device ID: `ESP32_MOCK_VL53L0X`
- ✅ Battery & signal simulated

**Data Mock:**
```javascript
{
  weight_kg: 9.5 - 11.0 kg,
  height_cm: 75.0 - 85.0 cm,
  deviceId: 'ESP32_MOCK_VL53L0X',
  quality: 'excellent',
  batteryLevel: 85-95%,
  signalStrength: -45 to -25 dBm
}
```

**Untuk testing UX/UI:**
- Flow pairing tetap sama
- Data mock auto-start setelah success
- Simulasi disconnect/reconnect

---

## 🔧 Setup Hardware Real (ESP32 + VL53L0X)

### **Untuk Production dengan ESP32 Real:**

#### **1. Hardware yang Dibutuhkan**
- ESP32 Dev Board
- VL53L0X Time-of-Flight Sensor (tinggi)
- HX711 Load Cell Amplifier + Load Cell (berat)
- Power supply (baterai Li-Ion 3.7V)
- Casing 3D printed

#### **2. Firmware ESP32**
```cpp
// Arduino IDE - Code ESP32
#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <VL53L0X.h>

// WiFi credentials
const char* ssid = "YourWiFi";
const char* password = "YourPassword";

// MQTT Broker
const char* mqtt_server = "broker.emqx.io";
const int mqtt_port = 1883;
const char* mqtt_topic = "babygrow/data/sensor";

VL53L0X sensor;
WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  
  // Init VL53L0X sensor
  Wire.begin();
  sensor.init();
  sensor.setTimeout(500);
  
  // Connect WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // Connect MQTT
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensor
  int height = sensor.readRangeSingleMillimeters();
  float weight = readLoadCell(); // Implement load cell reading
  
  // Publish to MQTT
  String payload = "{";
  payload += "\"height_cm\":" + String(height / 10.0) + ",";
  payload += "\"weight_kg\":" + String(weight) + ",";
  payload += "\"deviceId\":\"ESP32_VL53L0X_001\",";
  payload += "\"timestamp\":\"" + getTimestamp() + "\"";
  payload += "}";
  
  client.publish(mqtt_topic, payload.c_str());
  
  delay(3000); // Update every 3 seconds
}
```

#### **3. Update App BabyGrow**

**File**: `src/services/MQTTService.ts`

**Uncomment production code** (line 200+):
```typescript
// PRODUCTION: Real MQTT connection
try {
  const mqtt = require('mqtt');
  
  this.client = mqtt.connect(brokerUrl, {
    clientId: clientId,
    username: username,
    password: password,
    clean: true,
    reconnectPeriod: 5000,
    connectTimeout: 30000,
    keepalive: 60,
  });
  
  this.client.on('connect', () => {
    console.log('✅ MQTT Connected (Real)');
    this.connected = true;
    this.emit('connected', {...});
  });
  
  this.client.on('message', (topic, payload) => {
    const data = JSON.parse(payload.toString());
    this.latestMeasurement = data;
    this.emit('measurement', data);
  });
} catch (error) {
  console.error('MQTT Connection Error:', error);
}
```

---

## 📊 Monitoring Pairing Status

### **Indikator Status:**

| Status | Icon | Warna | Arti |
|--------|------|-------|------|
| Online | 🟢 | Hijau | Device terhubung, data streaming |
| Connecting | 🟡 | Kuning | Sedang menghubungkan... |
| Offline | 🔴 | Merah | Device terputus/tidak aktif |
| Error | ⚠️ | Orange | Koneksi error, perlu troubleshoot |

### **Hardware Health Widget:**

```
🟢 Connected        ← Status koneksi
🔋 87%             ← Battery level
📶 -45 dBm         ← Signal strength
🌡️ 25°C           ← Temperature (optional)
```

**Interpretasi Signal Strength:**
- `-30 to -20 dBm`: Excellent ⭐⭐⭐⭐⭐
- `-40 to -30 dBm`: Very Good ⭐⭐⭐⭐
- `-50 to -40 dBm`: Good ⭐⭐⭐
- `-60 to -50 dBm`: Fair ⭐⭐
- `< -60 dBm`: Poor ⭐

---

## 🎯 Tips & Best Practices

### ✅ Do's (Lakukan)
1. **Pairing sekali saja** - Device info tersimpan
2. **Perhatikan battery level** - Charge jika < 20%
3. **Jaga jarak** - Maksimal 10m untuk BLE
4. **WiFi stabil** - Untuk MQTT mode
5. **Update firmware** - Jika ada versi baru

### ❌ Don'ts (Jangan)
1. **Jangan pairing berulang kali** - Gunakan reconnect
2. **Jangan matikan WiFi** - Saat mode MQTT
3. **Jangan jauh dari device** - Saat mode BLE
4. **Jangan force close app** - Disconnect dulu
5. **Jangan pairing device lain** - 1 device per akun

---

## 🆘 Troubleshooting

### **Problem 1: Tombol "Ukur Otomatis" Tidak Ada**

**Solusi:**
1. Update app ke versi terbaru
2. Logout & login ulang
3. Check file: `UserDashboardScreen.tsx`

### **Problem 2: Modal Stuck di "Menghubungkan..."**

**Solusi:**
1. Tunggu 10-15 detik
2. Jika masih stuck, tap "Batal"
3. Check koneksi internet
4. Coba pairing ulang

### **Problem 3: Data Tidak Update**

**Solusi:**
1. Check status: Harus 🟢 Online
2. Check Hardware Health widget
3. Restart device IoT
4. Reconnect dari dashboard

### **Problem 4: "Device Already Paired"**

**Solusi:**
1. Disconnect device lama dulu
2. Go to: Profile → IoT Devices
3. Delete device lama
4. Pairing ulang

---

## 📚 Referensi

**Dokumentasi Terkait:**
- `MOCK-DATA-EXPLANATION.md` - Penjelasan mock sensor
- `docs/05-IOT-INTEGRATION.md` - Technical specs MQTT/BLE
- `UNICORN-TESTING-GUIDE.md` - Testing checklist
- `src/components/common/PairingModal.tsx` - Source code modal
- `src/services/MQTTService.ts` - MQTT service implementation

**Support:**
- GitHub Issues: [project-url]/issues
- Email: support@babygrow.app
- Telegram: @babygrow_support

---

## ✅ Checklist Pairing Berhasil

Setelah ikuti panduan di atas, verify:

- [ ] ✅ Tombol "Ukur Otomatis" muncul di dashboard
- [ ] ✅ Modal pairing terbuka saat diklik
- [ ] ✅ Status berubah: Connecting → Success
- [ ] ✅ Modal auto-close setelah 2.5 detik
- [ ] ✅ Live Measurement card menampilkan data
- [ ] ✅ Status: 🟢 Online (hijau)
- [ ] ✅ Hardware Health widget muncul
- [ ] ✅ Data update setiap 3 detik
- [ ] ✅ Battery & signal level terlihat
- [ ] ✅ Timestamp update "baru saja"

**Jika semua checklist ✅**, pairing BERHASIL! 🎉

---

**Created**: 2026-01-25  
**Updated**: 2026-01-25  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (Demo Mode)  
**Next Step**: Setup ESP32 hardware untuk production

---

**🦄 Unicorn 2026 Standard: Pairing Flow Complete!**
