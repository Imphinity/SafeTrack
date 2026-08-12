package com.example.pompieri.config;

import com.example.pompieri.handler.DeviceHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket SIMPLU (fara STOMP) - folosit de ESP32.
 * ESP32 trimite text/JSON brut, exact ca in exemplul cu Node.js + WebSocketsClient.
 *
 * ESP32 se conecteaza la: ws://IP:8080/device/{deviceId}
 * Ex: ws://192.168.1.100:8080/device/Pompier01
 */
@Configuration
@EnableWebSocket
public class DeviceWebSocketConfig implements WebSocketConfigurer {

    private final DeviceHandler deviceHandler;

    public DeviceWebSocketConfig(DeviceHandler deviceHandler) {
        this.deviceHandler = deviceHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(deviceHandler, "/device/{deviceId}")
                .setAllowedOrigins("*");
    }
}
