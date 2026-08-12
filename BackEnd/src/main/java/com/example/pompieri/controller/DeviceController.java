package com.example.pompieri.controller;

import com.example.pompieri.handler.DeviceHandler;
import com.example.pompieri.model.Command;
import org.springframework.web.bind.annotation.*;

/**
 * API REST folosit de APLICATIE (nu de ESP32).
 * Ex: POST /api/device/Pompier01/alarm  -> trimite alarma manual catre acel ESP32
 */
@RestController
@RequestMapping("/api/device")
public class DeviceController {

    private final DeviceHandler deviceHandler;

    public DeviceController(DeviceHandler deviceHandler) {
        this.deviceHandler = deviceHandler;
    }

    @PostMapping("/{deviceId}/alarm")
    public String trimiteAlarma(@PathVariable String deviceId) {
        boolean trimis = deviceHandler.trimiteComanda(deviceId, new Command("ALARM", "MANUAL"));
        return trimis
                ? "Comanda trimisa catre " + deviceId
                : "Dispozitivul " + deviceId + " nu este conectat";
    }
}
