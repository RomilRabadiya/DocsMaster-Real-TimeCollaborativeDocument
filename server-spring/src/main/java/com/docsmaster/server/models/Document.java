package com.docsmaster.server.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "tag")
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    private String subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<Collaborator> collaborators = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<PendingCollaborator> pendingCollaborators = new ArrayList<>();

    @Column(unique = true)
    private String shareCode;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isShared = false;

    private LocalDateTime selectionTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modified_by_id")
    private User modifiedBy;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Virtual field equivalent for keywords
    public List<String> getKeywords() {
        return this.tags;
    }
}
