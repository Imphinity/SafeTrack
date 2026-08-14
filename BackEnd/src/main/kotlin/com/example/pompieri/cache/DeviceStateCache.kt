package com.example.pompieri.cache

import com.example.pompieri.model.FirefighterDeviceState
import org.springframework.stereotype.Repository
import java.util.concurrent.ConcurrentHashMap

@Repository
class DeviceStateCache {
    // In production, back this with Redis HashOps
    private val activeDevices = ConcurrentHashMap<String, FirefighterDeviceState>()

    fun updateState(state: FirefighterDeviceState) {
        activeDevices[state.deviceId] = state
    }

    fun getLatestState(deviceId: String): FirefighterDeviceState? = activeDevices[deviceId]

    fun getAllActiveDevices(): List<FirefighterDeviceState> = activeDevices.values.toList()
}