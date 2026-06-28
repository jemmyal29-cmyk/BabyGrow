/*
 * BabyGrow - ESP32 BLE Firmware
 * 
 * Device: ESP32 (DevKit atau NodeMCU)
 * Purpose: BLE Server untuk komunikasi dengan Mobile App
 * 
 * Fitur:
 * - BLE Advertisement nama "BabyGrow_Alat"
 * - Service UUID: 0000fff0-0000-1000-8000-00805f9b34fb
 * - Characteristics: Height, Weight, Battery
 * - Real-time sensor data streaming
 * - Compatible dengan BabyGrow mobile app
 * 
 * Upload Settings:
 * - Board: ESP32 Dev Module
 * - Upload Speed: 115200
 * - COM Port: Sesuai device
 */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include <VL53L1X.h>
#include "HX711.h"

// ========================================
// BLE UUIDs (Harus sama dengan app!)
// ========================================
#define SERVICE_UUID        "0000fff0-0000-1000-8000-00805f9b34fb"
#define HEIGHT_CHAR_UUID    "0000fff1-0000-1000-8000-00805f9b34fb"
#define WEIGHT_CHAR_UUID    "0000fff2-0000-1000-8000-00805f9b34fb"
#define BATTERY_CHAR_UUID   "0000fff3-0000-1000-8000-00805f9b34fb"

// ========================================
// Pin Definitions
// ========================================
#define I2C_SDA           21    // VL53L1X SDA
#define I2C_SCL           22    // VL53L1X SCL
#define HX711_DT          14    // Load Cell Data
#define HX711_SCK         13    // Load Cell Clock
#define BATTERY_PIN       35    // Battery voltage (ADC)

// ========================================
// Sensor Configuration
// ========================================
#define SENSOR_MOUNT_HEIGHT  200.0  // Tinggi mount sensor dari lantai (cm)
#define CALIBRATION_FACTOR   -7050  // HX711 calibration (sesuaikan!)

// ========================================
// Global Variables
// ========================================
BLEServer *pServer = NULL;
BLECharacteristic *pHeightCharacteristic = NULL;
BLECharacteristic *pWeightCharacteristic = NULL;
BLECharacteristic *pBatteryCharacteristic = NULL;
bool deviceConnected = false;
bool oldDeviceConnected = false;

// Sensor objects
VL53L1X heightSensor;
HX711 scale;

// Sensor data
float currentHeight = 0.0;     // cm
float currentWeight = 0.0;     // kg
int batteryLevel = 87;         // percent
bool sensorInitialized = false;

// Timing
unsigned long lastHeightUpdate = 0;
unsigned long lastWeightUpdate = 0;
unsigned long lastBatteryUpdate = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 1000; // 1 second

// ========================================
// BLE Server Callbacks
// ========================================
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("✅ Device Connected!");
    Serial.println("📱 Mobile app terhubung ke ESP32");
    delay(500);
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("❌ Device Disconnected!");
    Serial.println("Siap untuk koneksi berikutnya...");
    
    // Start advertising again
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->start();
  }
};

// ========================================
// Characteristic Callbacks (dari mobile app)
// ========================================
class MyCharacteristicCallbacks : public BLECharacteristicCallbacks {
  void onRead(BLECharacteristic *pCharacteristic) {
    String charUUID = pCharacteristic->getUUID().toString().c_str();
    Serial.print("📖 Read request untuk: ");
    Serial.println(charUUID);
  }

  void onNotify(BLECharacteristic *pCharacteristic) {
    Serial.print("📤 Notify sent: ");
    Serial.println(pCharacteristic->getUUID().toString().c_str());
  }
};

// ========================================
// Setup - Dijalankan sekali saat startup
// ========================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║    BabyGrow ESP32 BLE Server v1.0    ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.println("");

  // Initialize BLE
  Serial.println("🔧 Initializing BLE...");
  BLEDevice::init("BabyGrow_Alat");
  
  // Create BLE Server
  Serial.println("📡 Creating BLE Server...");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create BLE Service
  Serial.println("📦 Creating BLE Service...");
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // ========================================
  // Create Height Characteristic (Notify)
  // ========================================
  Serial.println("📏 Creating HEIGHT characteristic...");
  pHeightCharacteristic = pService->createCharacteristic(
    HEIGHT_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | 
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pHeightCharacteristic->addDescriptor(new BLE2902());
  pHeightCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // ========================================
  // Create Weight Characteristic (Notify)
  // ========================================
  Serial.println("⚖️  Creating WEIGHT characteristic...");
  pWeightCharacteristic = pService->createCharacteristic(
    WEIGHT_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ | 
    BLECharacteristic::PROPERTY_NOTIFY
  );
  pWeightCharacteristic->addDescriptor(new BLE2902());
  pWeightCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // ========================================
  // Create Battery Characteristic (Read)
  // ========================================
  Serial.println("🔋 Creating BATTERY characteristic...");
  pBatteryCharacteristic = pService->createCharacteristic(
    BATTERY_CHAR_UUID,
    BLECharacteristic::PROPERTY_READ
  );
  pBatteryCharacteristic->setCallbacks(new MyCharacteristicCallbacks());

  // Start BLE Service
  Serial.println("🚀 Starting BLE Service...");
  pService->start();

  // ========================================
  // Initialize Sensors
  // ========================================
  Serial.println("");
  Serial.println("📡 Initializing Sensors...");
  
  // Initialize I2C for VL53L1X
  Serial.println("📏 Initializing VL53L1X height sensor...");
  Wire.begin(I2C_SDA, I2C_SCL);
  heightSensor.setTimeout(500);
  
  if (!heightSensor.init()) {
    Serial.println("❌ VL53L1X initialization failed!");
    Serial.println("   Cek koneksi: SDA→GPIO21, SCL→GPIO22");
    sensorInitialized = false;
  } else {
    heightSensor.setDistanceMode(VL53L1X::Long);
    heightSensor.setMeasurementTimingBudget(50000);
    heightSensor.startContinuous(50);
    Serial.println("✅ VL53L1X ready!");
    sensorInitialized = true;
  }
  
  // Initialize HX711 Load Cell
  Serial.println("⚖️  Initializing HX711 weight sensor...");
  scale.begin(HX711_DT, HX711_SCK);
  
  if (scale.wait_ready_timeout(1000)) {
    scale.set_scale(CALIBRATION_FACTOR);
    scale.tare();  // Reset scale to 0
    Serial.println("✅ HX711 ready!");
    Serial.println("   Tarring... (tidak boleh ada beban)");
    delay(1000);
  } else {
    Serial.println("❌ HX711 initialization failed!");
    Serial.println("   Cek koneksi: DT→GPIO14, SCK→GPIO13");
  }

  // Setup BLE Advertising
  Serial.println("📢 Setting up BLE Advertising...");
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x0);
  pAdvertising->start();

  Serial.println("");
  Serial.println("╔════════════════════════════════════════╗");
  Serial.println("║  ✅ BLE Server Ready!                 ║");
  Serial.println("║                                        ║");
  Serial.println("║  Device Name: BabyGrow_Alat           ║");
  Serial.println("║  Service UUID: 0000fff0...            ║");
  Serial.println("║                                        ║");
  Serial.println("║  Waiting for mobile app...             ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.println("");
}

// ========================================
// Main Loop
// ========================================
void loop() {
  unsigned long now = millis();

  // Disconnect handling
  if (!deviceConnected && oldDeviceConnected) {
    delay(500);
    pServer->startAdvertising();
    Serial.println("📻 Start advertising again");
    oldDeviceConnected = deviceConnected;
  }

  // Connection handling
  if (deviceConnected && !oldDeviceConnected) {
    Serial.println("📲 Mobile app connected!");
    oldDeviceConnected = deviceConnected;
  }

  // Update Height Sensor (setiap 1 detik)
  if (now - lastHeightUpdate >= SENSOR_UPDATE_INTERVAL) {
    if (deviceConnected && sensorInitialized) {
      // Read VL53L1X sensor
      heightSensor.read();
      
      if (!heightSensor.timeoutOccurred()) {
        uint16_t distance = heightSensor.ranging_data.range_mm;
        
        // Convert mm to cm and calculate height
        // Height = Mount height - Distance from sensor
        float distanceCm = distance / 10.0;
        currentHeight = SENSOR_MOUNT_HEIGHT - distanceCm;
        
        // Validate measurement (10-120 cm untuk balita)
        if (currentHeight >= 10.0 && currentHeight <= 120.0) {
          // Convert to string
          char heightStr[10];
          dtostrf(currentHeight, 6, 1, heightStr);
          
          // Set dan notify
          pHeightCharacteristic->setValue(heightStr);
          pHeightCharacteristic->notify();
          
          Serial.print("📏 Height: ");
          Serial.print(currentHeight);
          Serial.print(" cm (distance: ");
          Serial.print(distanceCm);
          Serial.println(" cm)");
        } else {
          Serial.print("⚠️  Invalid height: ");
          Serial.print(currentHeight);
          Serial.println(" cm (out of range)");
        }
      } else {
        Serial.println("❌ VL53L1X timeout!");
      }
    }
    lastHeightUpdate = now;
  }

  // Update Weight Sensor (setiap 1 detik)
  if (now - lastWeightUpdate >= SENSOR_UPDATE_INTERVAL) {
    if (deviceConnected) {
      // Read HX711 sensor (average 10 readings)
      if (scale.wait_ready_timeout(200)) {
        float rawWeight = scale.get_units(10);
        currentWeight = rawWeight / 1000.0; // Convert gram to kg
        
        // Validate measurement (2-30 kg untuk balita)
        if (currentWeight >= 2.0 && currentWeight <= 30.0) {
          // Convert to string
          char weightStr[10];
          dtostrf(currentWeight, 6, 2, weightStr);
          
          // Set dan notify
          pWeightCharacteristic->setValue(weightStr);
          pWeightCharacteristic->notify();
          
          Serial.print("⚖️  Weight: ");
          Serial.print(currentWeight);
          Serial.println(" kg");
        } else {
          Serial.print("⚠️  Invalid weight: ");
          Serial.print(currentWeight);
          Serial.println(" kg (out of range)");
        }
      } else {
        Serial.println("❌ HX711 not ready!");
      }
    }
    lastWeightUpdate = now;
  }

  // Update Battery Level (setiap 5 detik)
  if (now - lastBatteryUpdate >= 5000) {
    if (deviceConnected) {
      // Read battery voltage from ADC
      int adcValue = analogRead(BATTERY_PIN);
      float voltage = (adcValue / 4095.0) * 3.3 * 2; // Voltage divider 1:1
      
      // Convert to percentage (3.0V = 0%, 4.2V = 100%)
      batteryLevel = ((voltage - 3.0) / 1.2) * 100;
      if (batteryLevel < 0) batteryLevel = 0;
      if (batteryLevel > 100) batteryLevel = 100;
      
      // Convert to string
      char batteryStr[5];
      sprintf(batteryStr, "%d", batteryLevel);
      
      // Set (read only, no notify)
      pBatteryCharacteristic->setValue(batteryStr);
      
      Serial.print("🔋 Battery: ");
      Serial.print(batteryLevel);
      Serial.print("% (");
      Serial.print(voltage);
      Serial.println("V)");
    }
    lastBatteryUpdate = now;
  }

  delay(100); // Prevent watchdog timeout
}

/*
 * ========================================
 * UPLOAD INSTRUCTIONS
 * ========================================
 * 
 * 1. Install Arduino IDE
 *    https://www.arduino.cc/en/software
 * 
 * 2. Add ESP32 Board:
 *    - File → Preferences
 *    - Additional Board URLs:
 *      https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
 *    - Tools → Board Manager → Search "esp32" → Install
 * 
 * 3. Select Board:
 *    - Tools → Board → ESP32 → "ESP32 Dev Module"
 * 
 * 4. Configure Upload Settings:
 *    - Upload Speed: 115200
 *    - COM Port: (pilih sesuai device Anda)
 *    - Flash Mode: DIO
 *    - Partition Scheme: Default
 * 
 * 5. Connect ESP32:
 *    - Gunakan USB cable
 *    - Connect ke laptop
 * 
 * 6. Upload:
 *    - Sketch → Upload
 *    - Atau tekan Ctrl + U
 * 
 * 7. Monitor:
 *    - Tools → Serial Monitor
 *    - Baud Rate: 115200
 *    - Lihat output BLE server
 * 
 * ========================================
 * TESTING
 * ========================================
 * 
 * Setelah upload:
 * 
 * 1. Buka Serial Monitor (115200 baud)
 *    - Harus muncul "✅ BLE Server Ready!"
 * 
 * 2. Di HP Android:
 *    - Buka BabyGrow app
 *    - Tap "Ukur Otomatis"
 *    - Tap "Pair dengan Alat"
 *    - Cari "BabyGrow_Alat"
 *    - Tap untuk pair
 * 
 * 3. Lihat log di Serial Monitor:
 *    - "✅ Device Connected!"
 *    - "📏 Height: 78.5 cm"
 *    - "⚖️ Weight: 10.25 kg"
 *    - "🔋 Battery: 87%"
 * 
 * ========================================
 * TROUBLESHOOTING
 * ========================================
 * 
 * Problem: "Device not found"
 * Solution:
 *   - Pastikan ESP32 sudah upload code ini
 *   - Buka Serial Monitor untuk confirm
 *   - Reset ESP32 (tekan tombol reset)
 *   - Buka ulang BLE scan di app
 * 
 * Problem: "Connect failed"
 * Solution:
 *   - Pastikan Bluetooth di HP aktif
 *   - Dekatkan HP ke ESP32 (<2 meter)
 *   - Reset ESP32
 *   - Force close app dan buka ulang
 * 
 * Problem: "Data tidak muncul"
 * Solution:
 *   - Cek Serial Monitor untuk see data
 *   - Jika tidak ada, sensors mungkin tidak working
 *   - Code ini menggunakan SIMULATED data, bukan real sensors
 *   - Untuk real sensors, ganti bagian simulasi
 * 
 * Problem: "Serial Monitor kosong"
 * Solution:
 *   - Cek COM port (Tools → Port)
 *   - Cek Baud Rate (set ke 115200)
 *   - Reset ESP32 atau re-upload
 *   - Cek USB cable (mungkin data only, bukan charge)
 * 
 * ========================================
 * REAL SENSOR SETUP
 * ========================================
 * 
 * WIRING DIAGRAM:
 * 
 * 1. VL53L1X ToF Sensor (Height):
 *    VCC  → 3.3V
 *    GND  → GND
 *    SDA  → GPIO 21
 *    SCL  → GPIO 22
 * 
 * 2. HX711 Load Cell (Weight):
 *    VCC  → 3.3V
 *    GND  → GND
 *    DT   → GPIO 14
 *    SCK  → GPIO 13
 *    E+/E-/A+/A- → Load Cell
 * 
 * 3. Battery Monitor (Optional):
 *    Battery (+) → Voltage Divider → GPIO 35
 *    (Gunakan 100kΩ:100kΩ untuk 1:1 divider)
 * 
 * CALIBRATION:
 * 
 * 1. HX711 Calibration:
 *    - Letakkan beban yang diketahui (misal 1kg)
 *    - Baca raw value dari scale.read()
 *    - CALIBRATION_FACTOR = raw_value / weight_in_grams
 *    - Update #define CALIBRATION_FACTOR di atas
 * 
 * 2. VL53L1X Height Adjustment:
 *    - Ukur jarak dari sensor ke lantai saat dipasang
 *    - Update #define SENSOR_MOUNT_HEIGHT (dalam cm)
 *    - Height balita = SENSOR_MOUNT_HEIGHT - distance
 * 
 * LIBRARIES REQUIRED:
 *    - VL53L1X by Pololu
 *    - HX711 Arduino Library by Bogdan Necula
 *    (Install via Arduino Library Manager)
 * 
 * ========================================
 */
