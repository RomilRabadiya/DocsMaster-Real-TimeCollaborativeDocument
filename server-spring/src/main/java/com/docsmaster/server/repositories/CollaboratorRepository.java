package com.docsmaster.server.repositories;

import com.docsmaster.server.models.Collaborator;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CollaboratorRepository extends JpaRepository<Collaborator, String> {
    Optional<Collaborator> findByDocumentIdAndUserId(String documentId, String userId);
}
