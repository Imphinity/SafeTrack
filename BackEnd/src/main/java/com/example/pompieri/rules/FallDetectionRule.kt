package com.example.pompieri.rules

import com.example.pompieri.model.TelemetryPayload
import org.springframework.stereotype.Component

// Rule 2: Fall Detection (MPU6050)
@Component
class FallDetectionRule : AnomalyRule {
    override fun evaluate(telemetry: TelemetryPayload): RuleResult {
        // Calculate magnitude of acceleration vector: sqrt(x^2 + y^2 + z^2)
        val m = telemetry.motion
        val magnitude = Math.sqrt((m.ax * m.ax) + (m.ay * m.ay) + (m.az * m.az))

        // If magnitude is close to 0 (freefall) or spikes massively (impact)
        return if (magnitude > 3.0) { // 3G impact threshold (example)
            RuleResult(false, "Potential fall or impact detected!")
        } else {
            RuleResult(true)
        }
    }
}