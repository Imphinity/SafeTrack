package com.example.pompieri.config

import com.example.pompieri.websocket.Esp32WebSocketHandler
import com.example.pompieri.websocket.FrontendWebSocketHandler
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
open class WebSocketConfig(
    private val esp32WebSocketHandler: Esp32WebSocketHandler,
    private val frontendWebSocketHandler: FrontendWebSocketHandler // Added injected handler
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        // INBOUND: ESP32 sends raw telemetry here
        registry.addHandler(esp32WebSocketHandler, "/ws/device")
            .setAllowedOrigins("*")

        // OUTBOUND: Mobile App listens for processed dashboard updates here
        registry.addHandler(frontendWebSocketHandler, "/ws/frontend")
            .setAllowedOrigins("*")
    }
}