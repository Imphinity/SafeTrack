package com.example.pompieri.service

import com.example.pompieri.websocket.DeviceSessionManager
import org.springframework.stereotype.Service
import org.springframework.web.socket.TextMessage

@Service
class WebSocketDeviceCommandService(
    private val sessionManager: DeviceSessionManager
) : DeviceCommandService {

    override fun triggerSpeakerAlarm(deviceId: String) {
        // Find the specific connection for this device
        val session = sessionManager.getSession(deviceId)

        if (session != null && session.isOpen) {
            val payload = """{"command": "ALARM_ON"}"""
            session.sendMessage(TextMessage(payload))
            println("Sent ALARM_ON back to device: $deviceId")
        } else {
            println("Cannot send command. Device $deviceId is not connected.")
        }
    }

    override fun stopSpeakerAlarm(deviceId: String) {
        val session = sessionManager.getSession(deviceId)
        if (session != null && session.isOpen) {
            session.sendMessage(TextMessage("""{"command": "ALARM_OFF"}"""))
        }
    }
}