/*
 * ============================================================================
 * BabyGrow — ESP32 FULL (SATU FILE) → HiveMQ Cloud → App
 * ============================================================================
 * CARA PAKAI (Arduino IDE Windows):
 *   1) Buat folder: Documents\Arduino\Skripsi\
 *   2) Copy file ini sebagai: Skripsi.ino  (nama folder = nama file)
 *   3) WAJIB edit WIFI_SSID + WIFI_PASSWORD di bawah
 *   4) Board: ESP32 Dev Module | Upload Speed 115200
 *   5) Install library:
 *        - PubSubClient (Nick O'Leary)
 *        - VL53L1X (Pololu)
 *        - HX711 (Bogde)  ← pakai SATU library saja
 *   6) Upload → Serial Monitor 115200 baud
 *      Harus muncul: [WIFI] OK ... [MQTT] CONNECTED ... [MQTT] PUB ...
 *
 * Payload ke app:
 *   Topic: babygrow/measurements
 *   JSON : {"device_id":"...","weight":..,"height":..}
 *
 * Pin:
 *   VL53L1X  SDA=21 SCL=22
 *   HX711    DT=14  SCK=13
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <VL53L1X.h>
#include "HX711.h"

// ============================================================================
// ===== EDIT DI SINI (WAJIB) =====
// ============================================================================
static const char *WIFI_SSID     = "NAMA_WIFI_ANDA";      // <-- GANTI
static const char *WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";  // <-- GANTI

// HiveMQ Cloud (sudah cocok dengan app BabyGrow)
static const char *MQTT_HOST     = "c7f36a1bb1d8404789377b45eccc627f.s1.eu.hivemq.cloud";
static const uint16_t MQTT_PORT  = 8883;  // ESP32 = MQTT TLS (bukan 8884)
static const char *MQTT_USER     = "BABYGROW";
static const char *MQTT_PASS     = "Satusampelapan";
static const char *MQTT_TOPIC    = "babygrow/measurements";
static const char *MQTT_CLIENT_PREFIX = "babygrow_esp32";

// ============================================================================
// BUILD FLAGS
// ============================================================================
/** 0 = sensor asli | 1 = data simulasi jika sensor gagal */
#define DEMO_MODE           0
#define MQTT_INSECURE_TLS   1
#define REQUIRE_STABLE_SAMPLE 1

// ============================================================================
// PINOUT
// ============================================================================
#define I2C_SDA            21
#define I2C_SCL            22
#define HX711_DT           14
#define HX711_SCK          13
#define BATTERY_PIN        35
#define STATUS_LED         2

// ============================================================================
// SENSOR TUNING
// ============================================================================
#define SENSOR_MOUNT_HEIGHT_CM  200.0f
#define HX711_CAL_FACTOR        -7050.0f
#define HEIGHT_MIN_CM           40.0f
#define HEIGHT_MAX_CM           130.0f
#define WEIGHT_MIN_KG           2.0f
#define WEIGHT_MAX_KG           30.0f

#define SAMPLE_INTERVAL_MS      200UL
#define PUBLISH_INTERVAL_MS     1500UL
#define STABLE_WINDOW           5
#define STABLE_HEIGHT_STD_CM    0.40f
#define STABLE_WEIGHT_STD_KG    0.08f
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

float liveHeight = 0.0f;
float liveWeight = 0.0f;
int   batteryPct = 100;

float heightBuf[STABLE_WINDOW];
float weightBuf[STABLE_WINDOW];
uint8_t bufCount = 0;

unsigned long lastSampleMs = 0;
unsigned long lastPublishMs = 0;
unsigned long lastWifiAttemptMs = 0;
unsigned long lastMqttAttemptMs = 0;
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

// ============================================================================
// SENSORS
// ============================================================================
static bool initHeightSensor() {
  Wire.begin(I2C_SDA, I2C_SCL);
  heightSensor.setTimeout(500);
  if (!heightSensor.init()) {
    Serial.println("[SENSOR] VL53L1X init FAIL");
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
  delay(300);
  if (!scale.is_ready()) {
    Serial.println("[SENSOR] HX711 not ready");
    return false;
  }
  scale.set_scale(HX711_CAL_FACTOR);
  scale.tare();
  Serial.println("[SENSOR] HX711 OK (tared)");
  return true;
}

static bool readHeightCm(float &outCm) {
  if (!heightOk) return false;
  heightSensor.read();
  if (heightSensor.timeoutOccurred()) return false;
  float distanceCm = heightSensor.ranging_data.range_mm / 10.0f;
  float h = SENSOR_MOUNT_HEIGHT_CM - distanceCm;
  if (h < HEIGHT_MIN_CM || h > HEIGHT_MAX_CM) return false;
  outCm = h;
  return true;
}

static bool readWeightKg(float &outKg) {
  if (!weightOk) return false;
  if (!scale.is_ready()) return false;
  float grams = scale.get_units(8);
  float kg = grams / 1000.0f;
  if (kg < 0.05f) kg = 0.0f;
  if (kg > 0.0f && (kg < WEIGHT_MIN_KG || kg > WEIGHT_MAX_KG)) return false;
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
  stableW = lastW;
  return true;
#endif
}

// ============================================================================
// NETWORK — WiFi + MQTT TLS
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

  Serial.printf("[WIFI] Connecting to SSID '%s'...\n", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 12000) {
    delay(250);
    Serial.print('.');
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    wifiReady = true;
    Serial.printf("[WIFI] OK ip=%s rssi=%d\n",
                  WiFi.localIP().toString().c_str(), WiFi.RSSI());
    blinkStatus(2);
  } else {
    Serial.println("[WIFI] FAILED — will retry");
    blinkStatus(5, 40);
  }
}

static void mqttCallback(char *topic, byte *payload, unsigned int length) {
  Serial.printf("[MQTT] RX %s (%u bytes)\n", topic, length);
}

static bool connectMqtt() {
  if (!wifiReady) return false;

#if MQTT_INSECURE_TLS
  secureClient.setInsecure();
#else
  secureClient.setInsecure();
  Serial.println("[MQTT] WARN: CA belum dipasang — memakai setInsecure()");
#endif

  mqtt.setServer(MQTT_HOST, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setKeepAlive(30);
  mqtt.setSocketTimeout(15);
  mqtt.setBufferSize(512);

  Serial.printf("[MQTT] Connecting %s:%u as %s ...\n",
                MQTT_HOST, MQTT_PORT, mqttClientId.c_str());

  bool ok = mqtt.connect(
      mqttClientId.c_str(),
      MQTT_USER,
      MQTT_PASS,
      NULL, 0, false, NULL, true);

  if (ok) {
    mqttReady = true;
    mqttBackoffMs = MQTT_RETRY_BASE_MS;
    Serial.println("[MQTT] CONNECTED to HiveMQ Cloud");
    String statusTopic = String("babygrow/device/") + deviceId + "/status";
    mqtt.publish(statusTopic.c_str(), "{\"online\":true}", true);
    blinkStatus(3);
    return true;
  }

  mqttReady = false;
  Serial.printf("[MQTT] FAIL state=%d — backoff %lums\n",
                mqtt.state(), mqttBackoffMs);
  mqttBackoffMs = min(mqttBackoffMs * 2, MQTT_RETRY_MAX_MS);
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

  // Dedup longgar untuk demo (tetap kirim jika berubah sedikit)
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
    Serial.printf("[MQTT] PUB %s → %s\n", MQTT_TOPIC, payload);
    digitalWrite(STATUS_LED, HIGH);
    delay(30);
    digitalWrite(STATUS_LED, LOW);
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
  Serial.println(" BabyGrow ESP32 FULL → HiveMQ Cloud MQTT");
  Serial.println("================================================");

  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  pinMode(BATTERY_PIN, INPUT);

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

  heightOk = initHeightSensor();
  weightOk = initWeightSensor();
  if (!heightOk || !weightOk) {
    Serial.println("[WARN] Sensor partial/fail — set DEMO_MODE 1 jika perlu uji tanpa sensor");
  }

  ensureWiFi();
  if (wifiReady) connectMqtt();

  Serial.println("[BOOT] ready");
}

void loop() {
  ensureWiFi();
  ensureMqtt();

  unsigned long now = millis();

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

    if (gotH) {
      liveHeight = h;
      liveWeight = gotW ? w : 0.0f;
      pushSample(liveHeight, liveWeight);
    }
  }

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
