package com.docsmaster.server.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_pending_collaborators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingCollaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore
    private Document document;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role; 

    private java.time.LocalDateTime invitedAt;
}
