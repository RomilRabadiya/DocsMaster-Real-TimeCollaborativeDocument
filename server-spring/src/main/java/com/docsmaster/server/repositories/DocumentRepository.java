package com.docsmaster.server.repositories;

import com.docsmaster.server.models.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, String> {
    Optional<Document> findByShareCode(String shareCode);
    
    @Query("SELECT DISTINCT d FROM Document d LEFT JOIN d.collaborators c WHERE d.user.id = :userId OR c.user.id = :userId ORDER BY d.selectionTime DESC NULLS LAST, d.updatedAt DESC, d.createdAt DESC")
    List<Document> findAllByUserOrCollaborator(@Param("userId") String userId);
    
    @Query("SELECT DISTINCT d FROM Document d JOIN d.collaborators c WHERE c.user.id = :userId")
    List<Document> findSharedWithUser(@Param("userId") String userId);
}
