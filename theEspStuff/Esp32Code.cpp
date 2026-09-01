/*
  SafeTrack - Firmware ESP32 (Adapted for Spring Boot Backend)
*/

/*
needed libraries:
WebSockets by Markus Sattler
ArduinoJson by Benoit Blanchon
SparkFun MAX3010x Pulse and Proximity Sensor Library by SparkFun Electronics
TinyGPSPlus by Mikal Hart
Adafruit MPU6050 by Adafruit
DHT sensor library by Adafruit
*/

#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <time.h> // Required for syncing real time for Spring Boot

#include <MAX30105.h>
#include "heartRate.h"

#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

#include <DHT.h>

// ---------------- NETWORK & BACKEND CONFIG ----------------
const char* ssid = "imphinity's S23 Ultra";
const char* password = "123454321";

const char* serverHost = "10.152.162.90"; // YOUR COMPUTER'S LOCAL IP
const int serverPort = 8080;
const char* deviceId = "ESP32_01";         // Must match the ID registered in the React Native app

// ---------------- PINS ----------------
#define DHTPIN 4
#define DHTTYPE DHT22
#define MQ135_PIN 34
#define BUZZER_PIN 5
#define LED_PIN 2

#define GPS_RX_PIN 16
#define GPS_TX_PIN 17

// I2C for MPU6050
#define MPU_SDA_PIN 25
#define MPU_SCL_PIN 26

// ---------------- SENSOR OBJECTS ----------------
MAX30105 particleSensor;
TinyGPSPlus gps;
HardwareSerial gpsSerial(2);
TwoWire I2C_MPU = TwoWire(1);
Adafruit_MPU6050 mpu;
DHT dht(DHTPIN, DHTTYPE);
WebSocketsClient webSocket;

// ---------------- PULSE VARIABLES (MAX30102) ----------------
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg = 0;

// ---------------- TIMING ----------------
unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 3000;  // Send telemetry every 3 seconds

// ---------------- NTP SERVER CONFIG ----------------
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0; // Keep at 0 for UTC time (Spring Boot expects Zulu time)
const int   daylightOffset_sec = 0;

void setup() {
  Serial.begin(115200);

  delay(1500);
  Serial.println("\n\n--- ESP32 BOOTING ---");

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  // ---- WiFi ----
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();
  delay(100);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected! IP: " + WiFi.localIP().toString());

  // ---- Sync Time via NTP (Required for Spring Boot Instant) ----
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Syncing time...");

  // ---- I2C 1 - MAX30102 ----
  Wire.begin(21, 22);

  // ---- I2C 2 - MPU6050 ----
  I2C_MPU.begin(MPU_SDA_PIN, MPU_SCL_PIN);

  // ---- Initialize MAX30102 ----
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found! Check wiring.");
  } else {
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
  }

  // ---- Initialize MPU6050 ----
  if (!mpu.begin(MPU6050_I2CADDR_DEFAULT, &I2C_MPU)) {
    Serial.println("MPU6050 not found! Check wiring.");
  } else {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  }

  // ---- DHT22 ----
  dht.begin();

  // ---- GPS ----
  gpsSerial.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);

  // ---- MQ-135 Warmup ----
  Serial.println("Warming up gas sensor (20s)...");
  // delay(20000); // Uncomment this for real usage, skipped for faster testing

  // ---- WebSocket ----
  webSocket.begin(serverHost, serverPort, "/ws/device"); // Unified device endpoint
  webSocket.setExtraHeaders((String("device_name: ") + deviceId).c_str());
  webSocket.onEvent(onWebSocketEvent);
  webSocket.setReconnectInterval(3000);

  Serial.println("Setup Complete. Starting main loop.");
}

void loop() {
  webSocket.loop();

  // Continuously read GPS
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  // Continuously read Pulse
  readPulse();

  // Send data at fixed interval
  if (millis() - lastSend > SEND_INTERVAL) {
    lastSend = millis();
    sendTelemetryData();
  }
}

// ---------------------------------------------------------
// Pulse Reading Logic
// ---------------------------------------------------------
void readPulse() {
  long irValue = particleSensor.getIR();

  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();

    beatsPerMinute = 60 / (delta / 1000.0);

    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;

      int total = 0;
      for (byte x = 0; x < RATE_SIZE; x++) total += rates[x];
      beatAvg = total / RATE_SIZE;
    }
  }
}

// ---------------------------------------------------------
// SpO2 Estimation
// ---------------------------------------------------------
int estimateSpO2() {
  long irValue = particleSensor.getIR();
  if (irValue < 5000) return 0;  // No finger detected
  return 96 + random(-2, 3);     // Simulated realistic value
}

// ---------------------------------------------------------
// Generate ISO8601 Timestamp for Spring Boot
// ---------------------------------------------------------
String getISOTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "2026-08-14T12:00:00Z"; // Fallback if Wi-Fi time fails
  }
  char timeStringBuff[35];
  strftime(timeStringBuff, sizeof(timeStringBuff), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timeStringBuff);
}

// ---------------------------------------------------------
// Build JSON and Send to Backend
// ---------------------------------------------------------
void sendTelemetryData() {
  // ---- DHT22 ----
  float temp = dht.readTemperature();
  float humidity = dht.readHumidity();
  if (isnan(temp) || isnan(humidity)) {
    temp = 0;
    humidity = 0;
  }

  // ---- MQ-135 ----
  float gasVal = (float)analogRead(MQ135_PIN);

  // ---- MPU6050 ----
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);

  // Convert m/s^2 to G-forces (1G = 9.81 m/s^2) for the Backend Evaluator
  float ax = a.acceleration.x / 9.81;
  float ay = a.acceleration.y / 9.81;
  float az = a.acceleration.z / 9.81;

  // ---- GPS ----
  bool GPS_SIMULATED = true;
  double lat = 46.7712;
  double lng = 23.6236;

  if (!GPS_SIMULATED && gps.location.isValid()) {
    lat = gps.location.lat();
    lng = gps.location.lng();
  }

  // ---- Battery ----
  int batteryLevel = 92;

  // ---- Build Nested JSON Payload ----
  // Using 1024 bytes to ensure enough space for nested objects
  StaticJsonDocument<1024> doc;

  doc["deviceId"] = deviceId;
  doc["timestamp"] = getISOTimestamp();
  doc["batteryLevel"] = batteryLevel;

  JsonObject health = doc.createNestedObject("health");
  health["heartRate"] = beatAvg;
  health["spO2"] = estimateSpO2();

  JsonObject env = doc.createNestedObject("environment");
  env["temp"] = temp;
  env["humidity"] = humidity;
  env["gasPpm"] = gasVal;

  JsonObject motion = doc.createNestedObject("motion");
  motion["ax"] = ax;
  motion["ay"] = ay;
  motion["az"] = az;
  motion["gx"] = g.gyro.x;
  motion["gy"] = g.gyro.y;
  motion["gz"] = g.gyro.z;

  JsonObject location = doc.createNestedObject("location");
  location["lat"] = lat;
  location["lng"] = lng;

  String payload;
  serializeJson(doc, payload);

  webSocket.sendTXT(payload);
  Serial.println("Sent: " + payload);
}

// ---------------------------------------------------------
// WebSocket Event Handler (Listens for Backend Commands)
// ---------------------------------------------------------
void onWebSocketEvent(WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      Serial.println("Connected to Spring Boot backend!");
      break;

    case WStype_DISCONNECTED:
      Serial.println("Disconnected from backend.");
      break;

    case WStype_TEXT: {
      StaticJsonDocument<256> cmd;
      DeserializationError err = deserializeJson(cmd, payload, length);
      if (err) return;

      String command = cmd["command"] | "";
      Serial.println("Command received: " + command);

      // Matches exactly what WebSocketDeviceCommandService.kt sends
      if (command == "ALARM_ON") {
        digitalWrite(BUZZER_PIN, HIGH);
        digitalWrite(LED_PIN, HIGH);
      } else if (command == "ALARM_OFF") {
        digitalWrite(BUZZER_PIN, LOW);
        digitalWrite(LED_PIN, LOW);
      }
      break;
    }
    default:
      break;
  }
}