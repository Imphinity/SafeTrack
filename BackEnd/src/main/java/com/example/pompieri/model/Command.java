package com.example.pompieri.model;

/**
 * Comanda trimisa DE LA backend CATRE ESP32 (ex: alarma).
 */
public class Command {

    private String action;
    private String reason;

    public Command() {
    }

    public Command(String action, String reason) {
        this.action = action;
        this.reason = reason;
    }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
