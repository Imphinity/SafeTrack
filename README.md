# SafeTrack
A wearable IoT system that monitors a firefighter's physiological state and surrounding environment in real time during an intervention, streaming the data to a dispatch application over a bidirectional connection.
# SafeTrack — Smart Monitoring System for Firefighters

A wearable IoT system that monitors a firefighter's physiological state and surrounding environment in real time during an intervention, streaming the data to a dispatch application over a bidirectional connection.

## About

The device, worn as part of the firefighter's gear, continuously collects data on heart rate, blood oxygen saturation, ambient temperature and humidity, air quality, GPS location, and body movement (including fall detection). This data is sent live to a backend server, which validates it, stores it, and instantly forwards it to a monitoring application — allowing a dispatcher or commander to track multiple firefighters at once and trigger manual or automatic alerts.

## Architecture

```
ESP32 + sensors  ⇄  Backend (Spring Boot)  ⇄  App (Dashboard)
     WebSocket              STOMP / REST
```

- The **ESP32** connects to the backend through a dedicated WebSocket per device (`/device/{id}`), periodically sending a JSON payload with all sensor readings.
- The **backend** validates incoming data, checks critical thresholds (e.g. dangerously high heart rate), and, when needed, instantly sends a command back to the device (sound/visual alarm) over the same connection.
- The **application** receives live updates through a separate STOMP channel (`/topic/firefighter/{id}`), with no polling required, and can send manual commands through a REST API.

## Hardware components

| Component | Role |
|---|---|
| ESP32 Dev Board | Central microcontroller, WiFi + Bluetooth |
| MAX30102 | Heart rate and SpO₂ |
| MQ-135 | Air quality / gas detection |
| NEO-6M | GPS location |
| MPU6050 | Accelerometer + gyroscope (fall detection) |
| DHT22 | Ambient temperature and humidity |
| Buzzer + LEDs | Audible and visual alerts |
| Li-Ion battery | Power supply |

## Tech stack

- **Firmware:** Arduino (C++), `WebSocketsClient`, `ArduinoJson`
- **Backend:** Java, Spring Boot, WebSocket + STOMP, REST API
- **Communication:** Bidirectional WebSocket (ESP32 ↔ Backend), STOMP over WebSocket (Backend ↔ App)

## Backend structure

```
src/main/java/com/example/pompieri/
├── PompieriBackendApplication.java   — application entry point
├── config/
│   ├── DeviceWebSocketConfig.java    — WebSocket setup for ESP32 devices
│   └── StompConfig.java              — STOMP setup for the application
├── handler/
│   └── DeviceHandler.java            — receives data, validates, forwards, alerts
├── controller/
│   └── DeviceController.java         — REST API for manual commands
└── model/
    ├── SensorData.java               — structure of messages sent by ESP32
    └── Command.java                  — structure of commands sent to ESP32
```

## Running locally

```bash
./mvnw spring-boot:run
```

The server starts on port `8080` by default.

- ESP32 connects to: `ws://<local-IP>:8080/device/{deviceId}`
- App connects to: `ws://<local-IP>:8080/ws-app`, subscribing to `/topic/firefighter/{deviceId}`

## Message format (ESP32 → Backend)

```json
{
  "deviceId": "Firefighter01",
  "pulse": 82,
  "spo2": 98,
  "temperature": 24.5,
  "humidity": 45,
  "gas": 120,
  "latitude": 45.74,
  "longitude": 21.22,
  "fall": false,
  "batteryLevel": 87,
  "timestamp": "2026-08-12T10:22:15"
}
```

## Status

Built as part of a high school competition project — actively in development.

## Author

*Coman Razvan, Bara Matei, Budisan Tudor, Lup Andrei, Visan Petra, Sican Luca*