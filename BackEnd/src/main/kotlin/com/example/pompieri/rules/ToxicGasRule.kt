package com.example.pompieri.rules

import com.example.pompieri.model.TelemetryPayload
import org.springframework.stereotype.Component

// Rule 1: Toxic Gas Detection
@Component
class ToxicGasRule : AnomalyRule {
    override fun evaluate(telemetry: TelemetryPayload): RuleResult {
        // MQ-135 threshold for dangerous gas
        return if (telemetry.environment.gasPpm > 1000.0) {
            RuleResult(false, "High toxic gas levels detected (${telemetry.environment.gasPpm} PPM)!")
        } else {
            RuleResult(true)
        }
    }
}