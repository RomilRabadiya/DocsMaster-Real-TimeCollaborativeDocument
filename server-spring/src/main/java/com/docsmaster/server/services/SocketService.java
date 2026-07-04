package com.docsmaster.server.services;

import com.corundumstudio.socketio.SocketIOServer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SocketService {

    private final SocketIOServer socketIOServer;

    @jakarta.annotation.PostConstruct
    private void initListeners() {
        socketIOServer.addConnectListener(client -> {
            System.out.println("🔌 A user connected: " + client.getSessionId());
        });

        socketIOServer.addDisconnectListener(client -> {
            System.out.println("A user disconnected: " + client.getSessionId());
        });

        socketIOServer.addEventListener("joinDocument", String.class, (client, documentId, ackSender) -> {
            client.joinRoom(documentId);
            System.out.println("User " + client.getSessionId() + " joined room: " + documentId);
        });

        socketIOServer.addEventListener("joinUserRoom", String.class, (client, userId, ackSender) -> {
            client.joinRoom("user_" + userId);
            System.out.println("User " + client.getSessionId() + " joined user room: " + userId);
        });

        socketIOServer.addEventListener("leaveDocument", String.class, (client, documentId, ackSender) -> {
            client.leaveRoom(documentId);
            System.out.println("User " + client.getSessionId() + " left room: " + documentId);
        });

        socketIOServer.addEventListener("send-changes", java.util.Map.class, (client, data, ackSender) -> {
            String documentId = (String) data.get("documentId");
            // Add sender socket ID to the payload so the frontend can filter it out
            data.put("senderId", client.getSessionId().toString());
            socketIOServer.getRoomOperations(documentId).sendEvent("receive-changes", data);
        });
    }

    public void sendToRoom(String room, String eventName, Object data) {
        socketIOServer.getRoomOperations(room).sendEvent(eventName, data);
    }

    public void broadcast(String eventName, Object data) {
        socketIOServer.getBroadcastOperations().sendEvent(eventName, data);
    }
}
