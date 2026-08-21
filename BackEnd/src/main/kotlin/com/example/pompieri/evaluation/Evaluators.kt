package com.example.pompieri.evaluation

import com.example.pompieri.model.EvaluatedMetrics
import com.example.pompieri.model.MetricLevel
import com.example.pompieri.model.MetricResult
import com.example.pompieri.model.TelemetryPayload
import org.springframework.stereotype.Component
import kotlin.math.abs
import kotlin.math.sqrt

// The contract for all evaluators
interface MetricEvaluator {
    fun evaluate(telemetry: TelemetryPayload): MetricResult
}

@Component
class HeartbeatEvaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val bpm = telemetry.health.heartRate
        val level = when {
            bpm < 50 || bpm > 160 -> MetricLevel.CRITICAL
            bpm in 50..59 || bpm in 111..160 -> MetricLevel.WARNING
            else -> MetricLevel.NORMAL
        }
        return MetricResult("$bpm BPM", level)
    }
}

@Component
class SpO2Evaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val spO2 = telemetry.health.spO2
        val level = when {
            spO2 < 90 -> MetricLevel.CRITICAL
            spO2 in 90..94 -> MetricLevel.WARNING
            else -> MetricLevel.NORMAL
        }
        return MetricResult("$spO2%", level)
    }
}

@Component
class TemperatureEvaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val temp = telemetry.environment.temp
        val level = when {
            temp > 65.0 -> MetricLevel.CRITICAL
            temp > 45.0 -> MetricLevel.WARNING
            else -> MetricLevel.NORMAL
        }
        return MetricResult("${temp}°C", level)
    }
}

@Component
class GasLevelEvaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val gas = telemetry.environment.gasPpm
        val level = when {
            gas > 2000.0 -> MetricLevel.CRITICAL
            gas > 1000.0 -> MetricLevel.WARNING
            else -> MetricLevel.NORMAL
        }
        return MetricResult("$gas PPM", level)
    }
}

@Component
class AirQualityEvaluator : MetricEvaluator {
    // Combines Gas, Temp, and Humidity for a human-readable state
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val temp = telemetry.environment.temp
        val gas = telemetry.environment.gasPpm

        return when {
            gas > 2000.0 || temp > 65.0 -> MetricResult("Dangerous", MetricLevel.CRITICAL)
            gas > 1000.0 || temp > 45.0 -> MetricResult("Hard to Breathe", MetricLevel.WARNING)
            else -> MetricResult("Good", MetricLevel.NORMAL)
        }
    }
}

@Component
class MotionEvaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val m = telemetry.motion
        // Calculate magnitude of 3D acceleration vector
        val aMag = sqrt((m.ax * m.ax) + (m.ay * m.ay) + (m.az * m.az))

        return when {
            aMag < 0.4 || aMag > 3.5 -> MetricResult("Falling / Impact", MetricLevel.CRITICAL)
            // If g-force is normal (1g), but Z-axis is near 0 and X/Y are high, the firefighter is horizontal
            aMag in 0.8..1.2 && abs(m.az) < 0.5 && (abs(m.ax) > 0.8 || abs(m.ay) > 0.8) ->
                MetricResult("Fallen", MetricLevel.CRITICAL)
            aMag > 2.0 -> MetricResult("Running", MetricLevel.WARNING)
            aMag > 1.3 -> MetricResult("Walking", MetricLevel.NORMAL)
            else -> MetricResult("Standing", MetricLevel.NORMAL)
        }
    }
}

@Component
class BatteryEvaluator : MetricEvaluator {
    override fun evaluate(telemetry: TelemetryPayload): MetricResult {
        val battery = telemetry.batteryLevel
        val level = when {
            battery < 10 -> MetricLevel.CRITICAL
            battery < 25 -> MetricLevel.WARNING
            else -> MetricLevel.NORMAL
        }
        return MetricResult("$battery%", level)
    }
}