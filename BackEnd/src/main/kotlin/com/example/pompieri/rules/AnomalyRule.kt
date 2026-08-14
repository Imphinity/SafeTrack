package com.example.pompieri.rules

import com.example.pompieri.model.TelemetryPayload

// The contract for all rules
interface AnomalyRule {
    fun evaluate(telemetry: TelemetryPayload): RuleResult
}

data class RuleResult(val isPassed: Boolean, val warningMessage: String? = null)
