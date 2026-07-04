package com.docsmaster.server.config;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PreDestroy;

@Configuration
public class SocketIOConfig {

    private SocketIOServer server;

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("localhost");
        config.setPort(8082); // Running Netty on a different port than Tomcat
        
        // Allow CORS
        config.setOrigin("*");

        server = new SocketIOServer(config);
        server.start();
        return server;
    }

    @PreDestroy
    public void stopSocketServer() {
        if (server != null) {
            server.stop();
        }
    }
}
