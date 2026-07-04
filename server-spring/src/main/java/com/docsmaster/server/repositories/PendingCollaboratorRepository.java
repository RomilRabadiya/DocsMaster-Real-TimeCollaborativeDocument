package com.docsmaster.server.repositories;

import com.docsmaster.server.models.PendingCollaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PendingCollaboratorRepository extends JpaRepository<PendingCollaborator, String> {
    List<PendingCollaborator> findByEmail(String email);
    Optional<PendingCollaborator> findByDocumentIdAndEmail(String documentId, String email);
}
