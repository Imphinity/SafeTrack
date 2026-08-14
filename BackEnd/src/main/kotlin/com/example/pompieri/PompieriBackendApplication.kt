package com.example.pompieri

import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication

@SpringBootApplication
open class PompieriBackendApplication {  // <-- Change 'object' to 'open class'
    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            SpringApplication.run(PompieriBackendApplication::class.java, *args)
        }
    }
}