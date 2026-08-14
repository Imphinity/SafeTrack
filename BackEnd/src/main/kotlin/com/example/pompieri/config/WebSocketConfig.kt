package com.example.pompieri.config

import com.example.pompieri.websocket.Esp32WebSocketHandler
import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
open class WebSocketConfig(
    private val esp32WebSocketHandler: Esp32WebSocketHandler
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        // This maps your handler to the exact URL we will use in Postman
        // setAllowedOrigins("*") allows Postman (and later your frontend) to connect without CORS errors
        registry.addHandler(esp32WebSocketHandler, "/ws/device")
            .setAllowedOrigins("*")
    }
}