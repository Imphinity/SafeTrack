package com.example.pompieri.controller

import com.example.pompieri.cache.DeviceStateCache
import com.example.pompieri.model.FirefighterDeviceState
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.CrossOrigin

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = ["*"]) // Allows your React Native app to request data without CORS errors
class FrontendController(private val stateCache: DeviceStateCache) {

    // Frontend calls GET /api/devices to see all firefighters on the dashboard
    @GetMapping
    fun getAllDevices(): List<FirefighterDeviceState> {
        return stateCache.getAllActiveDevices()
    }

    // Frontend calls GET /api/devices/{deviceId} for a specific firefighter's details
    @GetMapping("/{deviceId}")
    fun getDeviceState(@PathVariable deviceId: String): FirefighterDeviceState? {
        return stateCache.getLatestState(deviceId)
    }
}