package com.docsmaster.server.controllers;

import com.docsmaster.server.dto.DocumentMapper;
import com.docsmaster.server.models.Collaborator;
import com.docsmaster.server.models.Document;
import com.docsmaster.server.models.PendingCollaborator;
import com.docsmaster.server.models.User;
import com.docsmaster.server.repositories.CollaboratorRepository;
import com.docsmaster.server.repositories.DocumentRepository;
import com.docsmaster.server.repositories.PendingCollaboratorRepository;
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

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class ShareController {

    private final DocumentRepository documentRepository;
    private final PendingCollaboratorRepository pendingCollaboratorRepository;
    private final CollaboratorRepository collaboratorRepository;
    private final UserRepository userRepository;
    private final SocketService socketService;

    @PostMapping("/share")
    public ResponseEntity<?> shareDocumentByEmail(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, String> payload) {
        String documentId = payload.get("documentId");
        String email = payload.get("email");
        String senderId = userDetails.getId();
        
        Optional<Document> docOpt = documentRepository.findById(documentId);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Document document = docOpt.get();
        
        // Owner must exist on the note
        if (!document.getUser().getId().equals(senderId)) {
            return ResponseEntity.status(404).body(Map.of("message", "Document not found or unauthorized"));
        }
        
        Optional<User> receiverOpt = userRepository.findByEmail(email);
        if (receiverOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
        User receiver = receiverOpt.get();
        
        if (receiver.getId().equals(senderId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot invite yourself"));
        }
        
        // Avoid duplicates
        boolean alreadyCollab = document.getCollaborators().stream()
                .anyMatch(c -> c.getUser().getId().equals(receiver.getId()));
        boolean alreadyPending = pendingCollaboratorRepository.findByDocumentIdAndEmail(documentId, email).isPresent();
        
        if (alreadyCollab || alreadyPending) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already shared with this user"));
        }

        PendingCollaborator pending = PendingCollaborator.builder()
                .document(document)
                .email(email)
                .role("editor")
                .invitedAt(LocalDateTime.now())
                .build();
        document.getPendingCollaborators().add(pending);
        document.setIsShared(true);
        document.setModifiedBy(userRepository.findById(senderId).orElse(null));
        documentRepository.save(document);
        
        return ResponseEntity.ok(Map.of("message", "Invitation sent successfully"));
    }

    @GetMapping("/invites")
    public ResponseEntity<?> getPendingInvites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        List<PendingCollaborator> invites = pendingCollaboratorRepository.findByEmail(user.getEmail());
        
        var inviteList = invites.stream().map(invite -> Map.of(
            "_id", invite.getId(),
            "document", Map.of(
                "_id", invite.getDocument().getId(),
                "title", invite.getDocument().getTitle()
            ),
            "role", invite.getRole(),
            "invitedAt", invite.getInvitedAt()
        )).toList();
        
        return ResponseEntity.ok(inviteList);
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptInvite(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, String> payload) {
        String documentId = payload.get("documentId");
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Optional<PendingCollaborator> pendingOpt = pendingCollaboratorRepository.findByDocumentIdAndEmail(documentId, user.getEmail());
        if (pendingOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No invitation found"));
        }
        PendingCollaborator pending = pendingOpt.get();
        
        Document document = pending.getDocument();
        
        // Remove pending
        document.getPendingCollaborators().remove(pending);
        
        // Add collaborator if not already present
        boolean alreadyCollab = document.getCollaborators().stream()
                .anyMatch(c -> c.getUser().getId().equals(user.getId()));
                
        if (!alreadyCollab) {
            Collaborator collaborator = Collaborator.builder()
                    .document(document)
                    .user(user)
                    .role("editor")
                    .addedAt(LocalDateTime.now())
                    .build();
            document.getCollaborators().add(collaborator);
        }
        
        document.setIsShared(true);
        document.setModifiedBy(user);
        documentRepository.save(document);
        
        com.docsmaster.server.dto.DocumentDto dto = DocumentMapper.toDto(document);
        socketService.sendToRoom(documentId, "participantsChanged", Map.of("documentId", documentId, "collaborators", dto.getCollaborators()));
        return ResponseEntity.ok(Map.of("message", "Invitation accepted"));
    }

    @PostMapping("/reject")
    public ResponseEntity<?> rejectInvite(@AuthenticationPrincipal UserDetailsImpl userDetails, @RequestBody Map<String, String> payload) {
        String documentId = payload.get("documentId");
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        
        Optional<PendingCollaborator> pendingOpt = pendingCollaboratorRepository.findByDocumentIdAndEmail(documentId, user.getEmail());
        if (pendingOpt.isPresent()) {
            pendingCollaboratorRepository.delete(pendingOpt.get());
        }
        
        return ResponseEntity.ok(Map.of("message", "Invitation rejected"));
    }
}
