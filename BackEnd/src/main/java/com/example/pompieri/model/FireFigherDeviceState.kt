package com.example.pompieri.model

import java.time.Instant

// --- 2. Device State (Outbound for Frontend) ---
// This is what the frontend fetches. It includes computed status.
enum class DeviceStatus { ONLINE, WARNING, CRITICAL, OFFLINE }

data class FirefighterDeviceState(
    val deviceId: String,
    val firefighterName: String, // Joined from your relational DB
    val lastSeen: Instant,
    val status: DeviceStatus,
    val activeWarnings: List<String>,
    val latestTelemetry: TelemetryPayload
)