/*
 * ============================================================================
 * BabyGrow ESP32 — FULL READY (LCD 16x2 + VL53L1X + HX711 + HiveMQ)
 * ============================================================================
 * Sidang / demo ready:
 *   - LCD menampilkan Tinggi & Berat secara live
 *   - Timbangan HX711 di-tare saat boot + debug Serial
 *   - MQTT TLS → HiveMQ → App (tombol Ukur Live)
 *   - BLE "BabyGrow_Alat" → App (tombol Ukur Otomatis / pairing)
 *
 * Library Arduino:
 *   1) PubSubClient          (Nick O'Leary)
 *   2) VL53L1X               (Pololu)
 *   3) HX711                 (Bogde) — PASANG SATU SAJA
 *   4) LiquidCrystal I2C     (Frank de Brabander / John Rickman)
 *   BLE = built-in ESP32 (tidak perlu library ekstra)
 *
 * Board: ESP32 Dev Module | Serial: 115200
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <VL53L1X.h>
#include "HX711.h"
#include <LiquidCrystal_I2C.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// UUID harus sama dengan mobile-app BLEService.ts
#define BLE_DEVICE_NAME     "BabyGrow_Alat"
#define BLE_SERVICE_UUID    "0000fff0-0000-1000-8000-00805f9b34fb"
#define BLE_HEIGHT_UUID     "0000fff1-0000-1000-8000-00805f9b34fb"
#define BLE_WEIGHT_UUID     "0000fff2-0000-1000-8000-00805f9b34fb"
#define BLE_BATTERY_UUID    "0000fff3-0000-1000-8000-00805f9b34fb"

// ============================================================================
// ===== KREDENSIAL (sudah diisi untuk demo) =====
// ============================================================================
static const char *WIFI_SSID     = "Bjirrrr";
static const char *WIFI_PASSWORD = "88888888";

static const char *MQTT_HOST     = "c7f36a1bb1d8404789377b45eccc627f.s1.eu.hivemq.cloud";
static const uint16_t MQTT_PORT  = 8883;
static const char *MQTT_USER     = "BABYGROW";
static const char *MQTT_PASS     = "Satusampelapan";
static const char *MQTT_TOPIC    = "babygrow/measurements";
static const char *MQTT_CLIENT_PREFIX = "babygrow_esp32";

// ============================================================================
// BUILD FLAGS
// ============================================================================
/** 0 = sensor asli | 1 = simulasi jika sensor gagal (untuk uji app saja) */
#define DEMO_MODE               0
#define MQTT_INSECURE_TLS       1
#define REQUIRE_STABLE_SAMPLE   1

// ============================================================================
// PINOUT
// ============================================================================
#define I2C_SDA             21
#define I2C_SCL             22
#define HX711_DT            14
#define HX711_SCK           13
#define BATTERY_PIN         35
#define STATUS_LED          2

// LCD — detect 0x27 / 0x3F saat boot (banyak modul beda alamat)
LiquidCrystal_I2C lcd27(0x27, 16, 2);
LiquidCrystal_I2C lcd3f(0x3F, 16, 2);
LiquidCrystal_I2C *lcd = &lcd27;

// ============================================================================
// SENSOR TUNING — sesuaikan tinggi mount & faktor load cell
// ============================================================================
/** Jarak sensor ToF ke lantai / alas ukur (cm) */
#define SENSOR_MOUNT_HEIGHT_CM  200.0f

/**
 * Faktor kalibrasi HX711.
 * Cara kalibrasi cepat:
 *   1) Boot tanpa beban → Serial lihat "raw after tare ~0"
 *   2) Taruh beban diketahui (mis. 5 kg) → catat raw
 *   3) CAL = raw / 5000 (gram). Sesuaikan tanda +/- jika terbalik.
 */
#define HX711_CAL_FACTOR        -7050.0f

#define HEIGHT_MIN_CM           30.0f
#define HEIGHT_MAX_CM           140.0f
/** Berat minimum untuk dianggap valid (kg) — longgar untuk balita */
#define WEIGHT_MIN_KG           0.5f
#define WEIGHT_MAX_KG           40.0f

#define SAMPLE_INTERVAL_MS      200UL
#define PUBLISH_INTERVAL_MS     1500UL
#define LCD_INTERVAL_MS         400UL
#define STABLE_WINDOW           5
#define STABLE_HEIGHT_STD_CM    0.50f
#define STABLE_WEIGHT_STD_KG    0.12f
#define WIFI_RETRY_MS           5000UL
#define MQTT_RETRY_BASE_MS      2000UL
#define MQTT_RETRY_MAX_MS       30000UL

// ============================================================================
// STATE
// ============================================================================
WiFiClientSecure secureClient;
PubSubClient mqtt(secureClient);

VL53L1X heightSensor;
HX711 scale;

String deviceId;
String mqttClientId;

bool wifiReady = false;
bool mqttReady = false;
bool heightOk = false;
bool weightOk = false;
bool lcdOk = false;
bool bleConnected = false;
bool bleWasConnected = false;

BLEServer *bleServer = nullptr;
BLECharacteristic *bleHeightChar = nullptr;
BLECharacteristic *bleWeightChar = nullptr;
BLECharacteristic *bleBatteryChar = nullptr;

unsigned long lastBleNotifyMs = 0;
#define BLE_NOTIFY_INTERVAL_MS 1000UL

float liveHeight = 0.0f;
float liveWeight = 0.0f;
bool  haveHeight = false;
bool  haveWeight = false;
int   batteryPct = 100;

float heightBuf[STABLE_WINDOW];
float weightBuf[STABLE_WINDOW];
uint8_t bufCount = 0;

unsigned long lastSampleMs = 0;
unsigned long lastPublishMs = 0;
unsigned long lastWifiAttemptMs = 0;
unsigned long lastMqttAttemptMs = 0;
unsigned long lastLcdUpdateMs = 0;
unsigned long mqttBackoffMs = MQTT_RETRY_BASE_MS;
uint32_t publishCount = 0;
float lastPublishedH = -999.0f;
float lastPublishedW = -999.0f;

// ============================================================================
// UTILS
// ============================================================================
static float clampf(float v, float lo, float hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

static float stddev(const float *arr, uint8_t n) {
  if (n < 2) return 9999.0f;
  float sum = 0;
  for (uint8_t i = 0; i < n; i++) sum += arr[i];
  float mean = sum / n;
  float acc = 0;
  for (uint8_t i = 0; i < n; i++) {
    float d = arr[i] - mean;
    acc += d * d;
  }
  return sqrtf(acc / n);
}

static void blinkStatus(uint8_t times, uint16_t onMs = 60) {
  for (uint8_t i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(onMs);
    digitalWrite(STATUS_LED, LOW);
    delay(onMs);
  }
}

static int readBatteryPercent() {
  int raw = analogRead(BATTERY_PIN);
  float v = (raw / 4095.0f) * 3.3f * 2.0f;
  int pct = (int)((v - 3.3f) / (4.2f - 3.3f) * 100.0f);
  return (int)clampf((float)pct, 0.0f, 100.0f);
}

/** Scan I2C — cari LCD 0x27 / 0x3F */
static uint8_t detectLcdAddress() {
  Serial.println("[I2C] Scanning...");
  uint8_t foundLcd = 0;
  for (uint8_t addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.printf("[I2C] device @ 0x%02X\n", addr);
      if (addr == 0x27 || addr == 0x3F) foundLcd = addr;
    }
  }
  if (foundLcd == 0) {
    Serial.println("[I2C] LCD not found — fallback 0x27");
    return 0x27;
  }
  Serial.printf("[I2C] LCD selected 0x%02X\n", foundLcd);
  return foundLcd;
}

static void lcdPrintLine(uint8_t row, const char *text) {
  if (!lcdOk || !lcd) return;
  char buf[17];
  snprintf(buf, sizeof(buf), "%-16s", text);
  lcd->setCursor(0, row);
  lcd->print(buf);
}

static void updateLCD(float h, float w, bool okH, bool okW) {
  if (!lcdOk || !lcd) return;

  char line0[17];
  char line1[17];

  if (okH && h > 0.1f) {
    snprintf(line0, sizeof(line0), "T: %5.1f cm     ", h);
  } else {
    snprintf(line0, sizeof(line0), "T: ---- cm      ");
  }

  // Status: B=BLE paired  O=MQTT online  M=MQTT down  W=WiFi down
  char status = bleConnected ? 'B' : (!wifiReady ? 'W' : (!mqttReady ? 'M' : 'O'));
  if (okW && w >= 0.05f) {
    snprintf(line1, sizeof(line1), "B:%5.2fkg  [%c] ", w, status);
  } else {
    snprintf(line1, sizeof(line1), "B: --.--kg [%c] ", status);
  }

  lcd->setCursor(0, 0);
  lcd->print(line0);
  lcd->setCursor(0, 1);
  lcd->print(line1);
}

// ============================================================================
// SENSORS
// ============================================================================
static bool initHeightSensor() {
  heightSensor.setTimeout(500);
  if (!heightSensor.init()) {
    Serial.println("[SENSOR] VL53L1X (0x29) FAIL");
    return false;
  }
  heightSensor.setDistanceMode(VL53L1X::Long);
  heightSensor.setMeasurementTimingBudget(50000);
  heightSensor.startContinuous(50);
  Serial.println("[SENSOR] VL53L1X OK");
  return true;
}

static bool initWeightSensor() {
  scale.begin(HX711_DT, HX711_SCK);
  delay(500);
  if (!scale.is_ready()) {
    Serial.println("[SENSOR] HX711 NOT READY — cek kabel DT=14 SCK=13");
    return false;
  }

  // Baca raw sebelum tare (debug)
  long rawBefore = scale.read_average(10);
  Serial.printf("[HX711] raw before tare = %ld\n", rawBefore);

  scale.set_scale(HX711_CAL_FACTOR);
  scale.tare(20);  // rata-rata 20 sampel, pastikan plat kosong
  delay(200);

  long rawAfter = scale.read_average(10);
  float units = scale.get_units(10);
  Serial.printf("[HX711] raw after tare  = %ld\n", rawAfter);
  Serial.printf("[HX711] units (kg*1000?) = %.2f  (expect ~0 tanpa beban)\n", units);
  Serial.printf("[HX711] CAL_FACTOR = %.1f\n", (double)HX711_CAL_FACTOR);
  Serial.println("[SENSOR] HX711 OK — pastikan plat KOSONG saat tare");
  return true;
}

static bool readHeightCm(float &outCm) {
  if (!heightOk) return false;
  heightSensor.read();
  if (heightSensor.timeoutOccurred()) return false;

  float distanceCm = heightSensor.ranging_data.range_mm / 10.0f;
  float h = SENSOR_MOUNT_HEIGHT_CM - distanceCm;

  // Debug berkala lewat Serial (bukan setiap loop)
  static unsigned long lastDbg = 0;
  if (millis() - lastDbg > 2000) {
    lastDbg = millis();
    Serial.printf("[ToF] dist=%.1f cm → height=%.1f cm\n", distanceCm, h);
  }

  if (h < HEIGHT_MIN_CM || h > HEIGHT_MAX_CM) return false;
  outCm = h;
  return true;
}

static bool readWeightKg(float &outKg) {
  if (!weightOk) return false;
  if (!scale.is_ready()) return false;

  // get_units biasanya dalam "unit kalibrasi".
  // Jika CAL_FACTOR diset untuk gram: bagi 1000 → kg.
  // Jika sudah untuk kg: langsung pakai.
  float units = scale.get_units(8);
  float kg = units;

  // Heuristik: kalau nilai abs besar (>100), anggap masih gram
  if (fabsf(kg) > 100.0f) {
    kg = kg / 1000.0f;
  }

  // Noise lantai
  if (fabsf(kg) < 0.05f) kg = 0.0f;
  // Beban negatif sering karena CAL terbalik — ambil absolut untuk demo
  if (kg < 0.0f) kg = fabsf(kg);

  static unsigned long lastDbg = 0;
  if (millis() - lastDbg > 2000) {
    lastDbg = millis();
    Serial.printf("[HX711] units=%.2f → kg=%.3f\n", units, kg);
  }

  // Untuk LCD: tampilkan apa adanya (termasuk < WEIGHT_MIN)
  // Untuk publish MQTT: filter di isStable / publish
  if (kg > WEIGHT_MAX_KG) return false;
  outKg = kg;
  return true;
}

static void pushSample(float h, float w) {
  if (bufCount < STABLE_WINDOW) {
    heightBuf[bufCount] = h;
    weightBuf[bufCount] = w;
    bufCount++;
  } else {
    for (uint8_t i = 1; i < STABLE_WINDOW; i++) {
      heightBuf[i - 1] = heightBuf[i];
      weightBuf[i - 1] = weightBuf[i];
    }
    heightBuf[STABLE_WINDOW - 1] = h;
    weightBuf[STABLE_WINDOW - 1] = w;
  }
}

static bool isStable(float &stableH, float &stableW) {
#if !REQUIRE_STABLE_SAMPLE
  if (bufCount == 0) return false;
  stableH = heightBuf[bufCount - 1];
  stableW = weightBuf[bufCount - 1];
  return stableH > 0;
#else
  if (bufCount < STABLE_WINDOW) return false;
  if (stddev(heightBuf, STABLE_WINDOW) > STABLE_HEIGHT_STD_CM) return false;
  float lastW = weightBuf[STABLE_WINDOW - 1];
  if (lastW > 0.5f && stddev(weightBuf, STABLE_WINDOW) > STABLE_WEIGHT_STD_KG) {
    return false;
  }
  stableH = heightBuf[STABLE_WINDOW - 1];
  // Publish berat hanya jika di atas ambang balita
  stableW = (lastW >= WEIGHT_MIN_KG) ? lastW : 0.0f;
  return true;
#endif
}

// ============================================================================
// BLE — nama iklan WAJIB "BabyGrow_Alat" (dipakai tombol Ukur Otomatis)
// ============================================================================
class BabyGrowBleCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer *pServer) override {
    bleConnected = true;
    Serial.println("[BLE] HP TERHUBUNG (pairing OK)");
  }
  void onDisconnect(BLEServer *pServer) override {
    bleConnected = false;
    Serial.println("[BLE] HP putus — advertising lagi");
    BLEDevice::startAdvertising();
  }
};

static void initBle() {
  Serial.println("[BLE] Init sebagai BabyGrow_Alat ...");
  BLEDevice::init(BLE_DEVICE_NAME);
  bleServer = BLEDevice::createServer();
  bleServer->setCallbacks(new BabyGrowBleCallbacks());

  BLEService *svc = bleServer->createService(BLE_SERVICE_UUID);

  bleHeightChar = svc->createCharacteristic(
      BLE_HEIGHT_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  bleHeightChar->addDescriptor(new BLE2902());

  bleWeightChar = svc->createCharacteristic(
      BLE_WEIGHT_UUID,
      BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  bleWeightChar->addDescriptor(new BLE2902());

  bleBatteryChar = svc->createCharacteristic(
      BLE_BATTERY_UUID, BLECharacteristic::PROPERTY_READ);

  svc->start();

  BLEAdvertising *adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(BLE_SERVICE_UUID);
  adv->setScanResponse(true);
  adv->setMinPreferred(0x06);
  adv->setMinPreferred(0x12);
  BLEDevice::startAdvertising();

  Serial.println("[BLE] Advertising ON — nama: BabyGrow_Alat");
  Serial.println("[BLE] App → Ukur Otomatis → harus menemukan alat ini");
}

static void notifyBle(float h, float w, int battery) {
  if (!bleConnected || !bleHeightChar || !bleWeightChar) return;

  char hStr[12];
  char wStr[12];
  char bStr[8];
  dtostrf(h, 5, 1, hStr);
  dtostrf(w, 5, 2, wStr);
  snprintf(bStr, sizeof(bStr), "%d", battery);

  bleHeightChar->setValue(hStr);
  bleHeightChar->notify();
  bleWeightChar->setValue(wStr);
  bleWeightChar->notify();
  if (bleBatteryChar) bleBatteryChar->setValue(bStr);

  Serial.printf("[BLE] notify H=%s W=%s bat=%s\n", hStr, wStr, bStr);
}

// ============================================================================
// NETWORK
// ============================================================================
static void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    return;
  }
  wifiReady = false;
  mqttReady = false;

  unsigned long now = millis();
  if (now - lastWifiAttemptMs < WIFI_RETRY_MS) return;
  lastWifiAttemptMs = now;

  if (lcdOk) {
    lcdPrintLine(0, "WiFi connecting");
    lcdPrintLine(1, WIFI_SSID);
  }

  Serial.printf("[WIFI] Connecting to '%s'...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.disconnect(true, true);
  delay(100);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    Serial.printf("[WIFI] OK ip=%s rssi=%d\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
    blinkStatus(2);
    if (lcdOk) {
      lcdPrintLine(0, "WiFi OK");
      lcdPrintLine(1, WiFi.localIP().toString().c_str());
      delay(800);
    }
  } else {
    Serial.println("[WIFI] FAILED — retry");
    blinkStatus(5, 40);
    if (lcdOk) {
      lcdPrintLine(0, "WiFi GAGAL");
      lcdPrintLine(1, "Cek SSID/Pass");
    }
  }
}

static void mqttCallback(char *topic, byte *payload, unsigned int length) {
  Serial.printf("[MQTT] RX %s (%u bytes)\n", topic, length);
}

static bool connectMqtt() {
  if (!wifiReady) return false;

  secureClient.setInsecure();
  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(30);
  mqtt.setSocketTimeout(15);
  mqtt.setBufferSize(512);

  Serial.printf("[MQTT] Connecting %s:%u as %s ...\n",
                MQTT_HOST, MQTT_PORT, mqttClientId.c_str());

  if (lcdOk) {
    lcdPrintLine(0, "MQTT connecting");
    lcdPrintLine(1, "HiveMQ Cloud");
  }

  bool ok = mqtt.connect(
      mqttClientId.c_str(),
      MQTT_USER,
      MQTT_PASS,
      NULL, 0, false, NULL, true);

  if (ok) {
    mqttReady = true;
    mqttBackoffMs = MQTT_RETRY_BASE_MS;
    Serial.println("[MQTT] CONNECTED → App siap terima data");
    String statusTopic = String("babygrow/device/") + deviceId + "/status";
    mqtt.publish(statusTopic.c_str(), "{\"online\":true}", true);
    blinkStatus(3);
    if (lcdOk) {
      lcdPrintLine(0, "MQTT CONNECTED");
      lcdPrintLine(1, "Siap ukur");
      delay(1000);
    }
    return true;
  }

  mqttReady = false;
  Serial.printf("[MQTT] FAIL state=%d — backoff %lums\n",
                mqtt.state(), mqttBackoffMs);
  mqttBackoffMs = min(mqttBackoffMs * 2, MQTT_RETRY_MAX_MS);
  if (lcdOk) {
    lcdPrintLine(0, "MQTT GAGAL");
    lcdPrintLine(1, "Cek internet");
  }
  return false;
}

static void ensureMqtt() {
  if (!wifiReady) return;
  if (mqtt.connected()) {
    mqttReady = true;
    mqtt.loop();
    return;
  }
  mqttReady = false;
  unsigned long now = millis();
  if (now - lastMqttAttemptMs < mqttBackoffMs) return;
  lastMqttAttemptMs = now;
  connectMqtt();
}

static bool publishMeasurement(float heightCm, float weightKg) {
  if (!mqtt.connected()) return false;

  if (fabsf(heightCm - lastPublishedH) < 0.05f &&
      fabsf(weightKg - lastPublishedW) < 0.02f &&
      publishCount > 0) {
    return false;
  }

  char payload[220];
  snprintf(
      payload, sizeof(payload),
      "{"
      "\"device_id\":\"%s\","
      "\"weight\":%.2f,"
      "\"height\":%.1f,"
      "\"weight_kg\":%.2f,"
      "\"height_cm\":%.1f,"
      "\"battery\":%d,"
      "\"rssi\":%d,"
      "\"seq\":%lu"
      "}",
      deviceId.c_str(),
      weightKg,
      heightCm,
      weightKg,
      heightCm,
      batteryPct,
      WiFi.RSSI(),
      (unsigned long)publishCount + 1);

  bool ok = mqtt.publish(MQTT_TOPIC, payload, false);
  if (ok) {
    publishCount++;
    lastPublishedH = heightCm;
    lastPublishedW = weightKg;
    Serial.printf("[MQTT] PUB → %s\n", payload);
    digitalWrite(STATUS_LED, HIGH);
    delay(40);
    digitalWrite(STATUS_LED, LOW);

    // Flash singkat di LCD bahwa data terkirim ke app
    if (lcdOk) {
      lcdPrintLine(0, ">> KIRIM KE APP");
      char msg[17];
      snprintf(msg, sizeof(msg), "%.1fcm %.2fkg", heightCm, weightKg);
      lcdPrintLine(1, msg);
      delay(600);
    }
  } else {
    Serial.println("[MQTT] publish failed");
  }
  return ok;
}

static void demoTick(float &h, float &w) {
  float t = millis() / 1000.0f;
  h = 80.0f + 1.5f * sinf(t * 0.7f);
  w = 10.2f + 0.4f * sinf(t * 0.55f + 1.2f);
}

// ============================================================================
// SETUP / LOOP
// ============================================================================
void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println();
  Serial.println("================================================");
  Serial.println(" BabyGrow ESP32 — LCD + ToF + HX711 + MQTT + BLE");
  Serial.println(" READY FOR SIDANG (Ukur Live + Ukur Otomatis)");
  Serial.println("================================================");

  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  pinMode(BATTERY_PIN, INPUT);

  // I2C bersama: LCD + VL53L1X
  Wire.begin(I2C_SDA, I2C_SCL);
  delay(100);

  {
    uint8_t addr = detectLcdAddress();
    lcd = (addr == 0x3F) ? &lcd3f : &lcd27;
    lcd->init();
    lcd->backlight();
    lcd->clear();
    lcdOk = true;
    Serial.printf("[LCD] using 0x%02X\n", addr);
  }
  lcdPrintLine(0, " BabyGrow System");
  lcdPrintLine(1, " Booting...");
  delay(800);

  uint64_t chip = ESP.getEfuseMac();
  char idBuf[32];
  snprintf(idBuf, sizeof(idBuf), "BG-NODE-%04X",
           (uint16_t)((chip >> 32) ^ (chip & 0xFFFF)));
  deviceId = String(idBuf);

  char clientBuf[48];
  snprintf(clientBuf, sizeof(clientBuf), "%s_%04X",
           MQTT_CLIENT_PREFIX, (uint16_t)(chip & 0xFFFF));
  mqttClientId = String(clientBuf);

  Serial.printf("device_id = %s\n", deviceId.c_str());
  Serial.printf("clientId  = %s\n", mqttClientId.c_str());
  Serial.printf("broker    = %s:%u\n", MQTT_HOST, MQTT_PORT);
  Serial.printf("topic     = %s\n", MQTT_TOPIC);
  Serial.printf("DEMO_MODE = %d\n", DEMO_MODE);
  Serial.printf("WIFI_SSID = %s\n", WIFI_SSID);

  lcdPrintLine(0, "Init sensors...");
  heightOk = initHeightSensor();
  weightOk = initWeightSensor();

  if (!heightOk && !weightOk) {
    lcdPrintLine(0, "SENSOR FAIL");
    lcdPrintLine(1, "Cek kabel/DEMO");
    Serial.println("[WARN] Kedua sensor gagal");
  } else if (!heightOk) {
    lcdPrintLine(0, "ToF FAIL");
    lcdPrintLine(1, "Cek VL53L1X");
  } else if (!weightOk) {
    lcdPrintLine(0, "HX711 FAIL");
    lcdPrintLine(1, "Cek load cell");
  } else {
    lcdPrintLine(0, "Sensor OK");
    lcdPrintLine(1, "ToF+HX711 ready");
  }
  delay(1200);

  // BLE dulu agar HP bisa scan saat WiFi masih connect
  lcdPrintLine(0, "BLE starting");
  lcdPrintLine(1, "BabyGrow_Alat");
  initBle();
  delay(500);

  ensureWiFi();
  if (wifiReady) connectMqtt();

  if (lcd) lcd->clear();
  lcdPrintLine(0, "SYSTEM READY");
  if (mqttReady) {
    lcdPrintLine(1, "BLE+MQTT ON");
  } else {
    lcdPrintLine(1, "BLE ON MQTT?");
  }
  delay(1200);
  if (lcd) lcd->clear();

  Serial.println("[BOOT] ready");
  Serial.println("  • Ukur Live     = MQTT/WiFi");
  Serial.println("  • Ukur Otomatis = Bluetooth BabyGrow_Alat");
}

void loop() {
  ensureWiFi();
  ensureMqtt();

  // Re-advertise setelah disconnect BLE
  if (!bleConnected && bleWasConnected) {
    delay(200);
    BLEDevice::startAdvertising();
    Serial.println("[BLE] re-advertise");
  }
  bleWasConnected = bleConnected;

  unsigned long now = millis();

  // ---- sample ----
  if (now - lastSampleMs >= SAMPLE_INTERVAL_MS) {
    lastSampleMs = now;
    batteryPct = readBatteryPercent();

    float h = 0, w = 0;
    bool gotH = readHeightCm(h);
    bool gotW = readWeightKg(w);

#if DEMO_MODE
    if (!gotH || !heightOk) {
      demoTick(h, w);
      gotH = true;
      gotW = true;
    } else if (!gotW) {
      float dh, dw;
      demoTick(dh, dw);
      w = dw;
      gotW = true;
    }
#endif

    haveHeight = gotH;
    haveWeight = gotW;

    if (gotH) {
      liveHeight = h;
      liveWeight = gotW ? w : 0.0f;
      pushSample(liveHeight, liveWeight);
    } else if (gotW) {
      liveWeight = w;
    }
  }

  // ---- LCD live ----
  if (now - lastLcdUpdateMs >= LCD_INTERVAL_MS) {
    lastLcdUpdateMs = now;
    updateLCD(liveHeight, liveWeight, haveHeight, haveWeight);
  }

  // ---- BLE notify ke HP yang sudah pair (Ukur Otomatis) ----
  if (bleConnected && (now - lastBleNotifyMs >= BLE_NOTIFY_INTERVAL_MS)) {
    lastBleNotifyMs = now;
    float hSend = haveHeight ? liveHeight : 0.0f;
    float wSend = haveWeight ? liveWeight : 0.0f;
#if DEMO_MODE
    if (hSend < 1.0f) {
      float dh, dw;
      demoTick(dh, dw);
      hSend = dh;
      wSend = dw;
    }
#endif
    if (hSend > 1.0f) {
      notifyBle(hSend, wSend, batteryPct);
    }
  }

  // ---- MQTT publish jika stabil (Ukur Live) ----
  if (mqttReady && (now - lastPublishMs >= PUBLISH_INTERVAL_MS)) {
    float sh = 0, sw = 0;
    if (isStable(sh, sw) && sh > 0) {
      if (publishMeasurement(sh, sw)) {
        lastPublishMs = now;
        bufCount = 0;
      } else {
        lastPublishMs = now;
      }
    }
  }

  delay(5);
}
