package com.docsmaster.server.socket;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.listener.ConnectListener;
import com.corundumstudio.socketio.listener.DataListener;
import com.corundumstudio.socketio.listener.DisconnectListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SocketModule {

    private final SocketIOServer server;

    public SocketModule(SocketIOServer server) {
        this.server = server;
        server.addConnectListener(onConnected());
        server.addDisconnectListener(onDisconnected());
        server.addEventListener("joinDocument", String.class, onJoinDocument());
        server.addEventListener("leaveDocument", String.class, onLeaveDocument());
    }

    private ConnectListener onConnected() {
        return client -> {
            log.info("Socket client connected: {}", client.getSessionId().toString());
        };
    }

    private DisconnectListener onDisconnected() {
        return client -> {
            log.info("Socket client disconnected: {}", client.getSessionId().toString());
        };
    }

    private DataListener<String> onJoinDocument() {
        return (client, documentId, ackSender) -> {
            log.info("Client {} joined document: {}", client.getSessionId().toString(), documentId);
            client.joinRoom(documentId);
            
            // Note: If you need to broadcast participantJoined, you would typically 
            // extract the user info (e.g. from token) and emit it here.
            // server.getRoomOperations(documentId).sendEvent("participantJoined", user);
        };
    }

    private DataListener<String> onLeaveDocument() {
        return (client, documentId, ackSender) -> {
            log.info("Client {} left document: {}", client.getSessionId().toString(), documentId);
            client.leaveRoom(documentId);
        };
    }
}
