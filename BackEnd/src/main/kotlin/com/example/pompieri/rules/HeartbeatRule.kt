package com.example.pompieri.rules

import com.example.pompieri.model.TelemetryPayload
import org.springframework.stereotype.Component

// Rule 3: Heartbeat Detection
@Component
class HeartbeatRule : AnomalyRule {
    override fun evaluate(telemetry: TelemetryPayload): RuleResult {
        val heartbeat = telemetry.health.heartRate
        return if (heartbeat !in 60 .. 180) {
            RuleResult(false, "Heartbeat abnormal (${heartbeat}bps)!")
        } else {
            RuleResult(true)
        }
    }
}