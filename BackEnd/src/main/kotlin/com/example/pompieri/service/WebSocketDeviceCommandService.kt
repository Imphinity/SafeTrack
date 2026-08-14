package com.example.pompieri.service

import com.example.pompieri.websocket.DeviceSessionManager
import org.springframework.stereotype.Service
import org.springframework.web.socket.TextMessage

@Service
class WebSocketDeviceCommandService(
    private val sessionManager: DeviceSessionManager
) : DeviceCommandService {

    override fun triggerSpeakerAlarm(deviceId: String) {
        val session = sessionManager.getSession(deviceId)
        if (session != null && session.isOpen) {
            val payload = """{"command": "ALARM_ON"}"""
            session.sendMessage(TextMessage(payload))
            println("Sent ALARM_ON to device $deviceId")
        } else {
            println("Device $deviceId is disconnected. Cannot send command.")
        }
    }

    override fun stopSpeakerAlarm(deviceId: String) {
        // Similar logic, sending {"command": "ALARM_OFF"}
    }
}