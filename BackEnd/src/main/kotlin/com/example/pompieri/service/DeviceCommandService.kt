package com.example.pompieri.service

// The contract for sending commands back to the ESP32
interface DeviceCommandService {

    // Sends a command to start the audio warning
    fun triggerSpeakerAlarm(deviceId: String)

    // Sends a command to stop the audio warning
    fun stopSpeakerAlarm(deviceId: String)
}