/**
 * COPY this file → secrets.h  (secrets.h di-gitignore, jangan di-commit)
 *
 * Isi WiFi Posyandu + kredensial HiveMQ Cloud Anda.
 */
#pragma once

// ---- WiFi Posyandu / Hotspot ----
static const char *WIFI_SSID     = "NAMA_WIFI_ANDA";
static const char *WIFI_PASSWORD = "PASSWORD_WIFI_ANDA";

// ---- HiveMQ Cloud (dari console Access Management) ----
// ESP32 pakai MQTT TLS port 8883 (bukan 8884 WebSocket)
static const char *MQTT_HOST     = "c7f36a1bb1d8404789377b45eccc627f.s1.eu.hivemq.cloud";
static const uint16_t MQTT_PORT  = 8883;
static const char *MQTT_USER     = "BABYGROW";
static const char *MQTT_PASS     = "Satusampelapan";
static const char *MQTT_TOPIC    = "babygrow/measurements";

// Prefiks clientId unik per board
static const char *MQTT_CLIENT_PREFIX = "babygrow_esp32";
