package com.example.pompieri.database

import com.example.pompieri.model.TelemetryPayload
import org.springframework.stereotype.Repository
import java.util.concurrent.Executors

// The contract for saving data
interface TelemetryDatabaseRepository {
    fun saveAsync(payload: TelemetryPayload)
}

// A basic implementation to get you started
@Repository
class PostgresTelemetryRepository : TelemetryDatabaseRepository {

    // Using a separate thread pool so database saves don't block
    // the real-time processing and alerting pipeline
    private val executor = Executors.newSingleThreadExecutor()

    override fun saveAsync(payload: TelemetryPayload) {
        executor.submit {
            // TODO: Map 'TelemetryPayload' to a JPA Entity and save to your database
            // e.g., jpaRepository.save(entity)
            println("Saved telemetry to database for device: ${payload.deviceId}")
        }
    }
}