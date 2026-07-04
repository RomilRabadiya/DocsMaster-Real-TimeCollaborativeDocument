package com.docsmaster.server.controllers;

import com.docsmaster.server.dto.DocumentDto;
import com.docsmaster.server.dto.DocumentMapper;
import com.docsmaster.server.models.Collaborator;
import com.docsmaster.server.models.Document;
import com.docsmaster.server.models.User;
import com.docsmaster.server.repositories.CollaboratorRepository;
import com.docsmaster.server.repositories.DocumentRepository;
import com.docsmaster.server.repositories.UserRepository;
import com.docsmaster.server.security.services.UserDetailsImpl;
import com.docsmaster.server.services.SocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final SocketService socketService;

    @GetMapping
    public ResponseEntity<List<DocumentDto>> getDocuments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Document> documents = documentRepository.findAllByUserOrCollaborator(userDetails.getId());
        return ResponseEntity.ok(documents.stream().map(DocumentMapper::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<DocumentDto>> getSharedDocumentsForUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        // Find documents where the current user is a collaborator
        String userId = userDetails.getId();
        List<Document> documents = documentRepository.findAllByUserOrCollaborator(userId).stream()
                .filter(doc -> !doc.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        return ResponseEntity.ok(documents.stream().map(DocumentMapper::toDto).collect(Collectors.toList()));
    }

    @PostMapping
    public ResponseEntity<DocumentDto> createDocument(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, Object> payload) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        List<String> keywords = payload.containsKey("keywords") ? (List<String>) payload.get("keywords") : new java.util.ArrayList<>();
        
        Document document = Document.builder()
                .title((String) payload.getOrDefault("title", "Untitled Document"))
                .content((String) payload.getOrDefault("content", ""))
                .tags(keywords)
                .user(user)
                .build();
                
        document = documentRepository.save(document);
        DocumentDto dto = DocumentMapper.toDto(document);
        
        socketService.broadcast("documentCreated", dto);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(@PathVariable String id, @RequestBody Map<String, Object> payload, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        
        String userId = userDetails.getId();
        boolean isOwner = document.getUser().getId().equals(userId);
        boolean isEditor = document.getCollaborators().stream()
                .anyMatch(c -> c.getUser().getId().equals(userId) && "editor".equalsIgnoreCase(c.getRole()));
                
        if (!isOwner && !isEditor) {
            return ResponseEntity.status(403).build();
        }
        
        if (payload.containsKey("title")) {
            document.setTitle((String) payload.get("title"));
        }
        if (payload.containsKey("content")) {
            document.setContent((String) payload.get("content"));
        }
        if (payload.containsKey("keywords")) {
            document.setTags((java.util.List<String>) payload.get("keywords"));
        }
        
        document = documentRepository.save(document);
        DocumentDto dto = DocumentMapper.toDto(document);
        
        socketService.sendToRoom(id, "documentUpdated", dto);
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable String id, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        String userId = userDetails.getId();
        
        if (document.getUser().getId().equals(userId)) {
            // Owner deletes document completely
            List<Collaborator> collabs = document.getCollaborators();
            documentRepository.deleteById(id);
            socketService.sendToRoom(id, "documentDeleted", id);
            
            // Notify all collaborators so it disappears from their dashboard
            if (collabs != null) {
                for (Collaborator c : collabs) {
                    socketService.sendToRoom("user_" + c.getUser().getId(), "documentDeleted", id);
                }
            }
            return ResponseEntity.ok().build();
        }
        
        // Collaborator removes their own access
        boolean isCollaborator = document.getCollaborators().removeIf(c -> c.getUser().getId().equals(userId));
        if (isCollaborator) {
            documentRepository.save(document);
            return ResponseEntity.ok().build();
        }
        
        return ResponseEntity.status(403).build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<?> shareDocument(@PathVariable String id) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        
        if (document.getShareCode() == null) {
            document.setShareCode(UUID.randomUUID().toString().substring(0, 8));
            document.setIsShared(true);
            document = documentRepository.save(document);
        }
        
        return ResponseEntity.ok(Map.of("shareCode", document.getShareCode()));
    }

    @PutMapping("/{id}/selection")
    public ResponseEntity<?> updateSelectionTime(@PathVariable String id) {
        Optional<Document> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        document.setSelectionTime(LocalDateTime.now());
        documentRepository.save(document);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shared/{code}")
    public ResponseEntity<DocumentDto> getSharedDocument(@PathVariable String code) {
        return documentRepository.findByShareCode(code)
                .map(doc -> ResponseEntity.ok(DocumentMapper.toDto(doc)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/shared/{code}/join")
    public ResponseEntity<?> joinSharedDocument(@PathVariable String code, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Optional<Document> docOpt = documentRepository.findByShareCode(code);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        // Check if already owner
        if (document.getUser().getId().equals(user.getId())) {
            return ResponseEntity.ok(DocumentMapper.toDto(document));
        }
        
        // Check if already a collaborator
        boolean alreadyCollaborator = document.getCollaborators().stream()
                .anyMatch(c -> c.getUser().getId().equals(user.getId()));
                
        if (!alreadyCollaborator) {
            Collaborator collaborator = Collaborator.builder()
                    .document(document)
                    .user(user)
                    .role("reader")
                    .build();
            document.getCollaborators().add(collaborator);
            documentRepository.save(document);
            
            DocumentDto dto = DocumentMapper.toDto(document);
            socketService.sendToRoom(document.getId(), "participantsChanged", Map.of("documentId", document.getId(), "collaborators", dto.getCollaborators()));
        }
        
        return ResponseEntity.ok(DocumentMapper.toDto(document));
    }
    
    @PutMapping("/{documentId}/collaborators/{userId}")
    public ResponseEntity<?> changeParticipantRole(@PathVariable String documentId, @PathVariable String userId, @RequestBody Map<String, String> payload, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        if (!document.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        Optional<Collaborator> collabOpt = document.getCollaborators().stream()
                .filter(c -> c.getUser().getId().equals(userId)).findFirst();
        if (collabOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        Collaborator collab = collabOpt.get();
        collab.setRole(payload.getOrDefault("role", "reader").toLowerCase());
        
        Document updatedDocument = documentRepository.save(document);
        DocumentDto dto = DocumentMapper.toDto(updatedDocument);
        socketService.sendToRoom(documentId, "participantsChanged", Map.of("documentId", documentId, "collaborators", dto.getCollaborators()));
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{documentId}/collaborators/{userId}")
    public ResponseEntity<?> removeParticipant(@PathVariable String documentId, @PathVariable String userId, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Document document = documentRepository.findById(documentId).orElseThrow();
        if (!document.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).build();
        }

        boolean removed = document.getCollaborators().removeIf(c -> c.getUser().getId().equals(userId));
        if (!removed) {
            return ResponseEntity.notFound().build();
        }
        
        Document updatedDocument = documentRepository.save(document);
        DocumentDto dto = DocumentMapper.toDto(updatedDocument);
        Map<String, Object> payload = Map.of("documentId", documentId, "collaborators", dto.getCollaborators());
        
        socketService.sendToRoom(documentId, "participantsChanged", payload);
        // Also notify the specific user so their dashboard removes the document instantly
        socketService.sendToRoom("user_" + userId, "participantsChanged", payload);
        
        return ResponseEntity.ok(dto);
    }
}
