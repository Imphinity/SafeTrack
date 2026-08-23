package com.example.pompieri.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class AppConfig {

    @Bean
    open fun objectMapper(): ObjectMapper {
        // Create it once, register the time module, and share it everywhere!
        return jacksonObjectMapper().registerModule(JavaTimeModule())
    }
}