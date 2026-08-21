package com.example.pompieri.service

interface WSConnectionInterface {

    fun sendMessage(sessionId: String, message: String)
    //todo: find a common interface for the two websocket communications, FE and device

}