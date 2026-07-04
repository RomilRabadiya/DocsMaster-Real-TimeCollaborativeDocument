package com.docsmaster.server.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "document_collaborators")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Collaborator {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "document_id", nullable = false)
    @JsonIgnore // Prevent infinite loop in JSON serialization
    private Document document;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String role; // "reader" or "editor"
    
    private java.time.LocalDateTime addedAt;
}
