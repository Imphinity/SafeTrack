package com.example.pompieri.model

import java.time.Instant

enum class DeviceStatus { ONLINE, WARNING, CRITICAL, OFFLINE }
enum class MetricLevel { NORMAL, WARNING, CRITICAL } // For UI Colors

// A pair containing the exact text to show, and the color level
data class MetricResult(
    val displayValue: String,
    val level: MetricLevel
)

// Grouping all evaluated data for the frontend Detail Drawer
data class EvaluatedMetrics(
    val heartbeat: MetricResult,
    val spO2: MetricResult,
    val temperature: MetricResult,
    val gasLevel: MetricResult,
    val airQuality: MetricResult,
    val motion: MetricResult,
    val battery: MetricResult
)

data class FirefighterDeviceState(
    val deviceId: String,
    val firefighterName: String,
    val lastSeen: Instant,
    val status: DeviceStatus,
    val activeWarnings: List<String>,
    val metrics: EvaluatedMetrics, // The cleanly interpreted data
    val rawLocation: LocationSensor // Passed as-is so the frontend map can use it
)