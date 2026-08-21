package com.example.pompieri.service

interface WSConnectionInterface {

    fun sendMessage(deviceId: String, message: String)

}