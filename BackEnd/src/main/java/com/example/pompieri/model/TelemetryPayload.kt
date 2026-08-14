package com.example.pompieri.model

import java.time.Instant

// --- 1. Raw Telemetry (Inbound from ESP32) ---
data class TelemetryPayload(
    val deviceId: String,
    val timestamp: Instant,
    val batteryLevel: Int,      // Percentage
    val health: HealthSensor,
    val environment: EnvironmentSensor,
    val motion: MotionSensor,
    val location: LocationSensor
)

data class HealthSensor(val heartRate: Int, val spO2: Int)

data class EnvironmentSensor(val temp: Double, val humidity: Double, val gasPpm: Double)

data class MotionSensor(
    val ax: Double, val ay: Double, val az: Double,
    val gx: Double, val gy: Double, val gz: Double
)

data class LocationSensor(val lat: Double, val lng: Double)