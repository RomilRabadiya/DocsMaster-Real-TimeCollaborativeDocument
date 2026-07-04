package com.docsmaster.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DocumentDto {
    @JsonProperty("_id")
    private String id;
    private String title;
    private String content;
    private List<String> tags;
    private List<String> keywords;
    private String subject;
    private UserDto user;
    private List<CollaboratorDto> collaborators;
    private List<PendingCollaboratorDto> pendingCollaborators;
    private String shareCode;
    private Boolean isShared;
    private LocalDateTime selectionTime;
    private UserDto modifiedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    public static class UserDto {
        @JsonProperty("_id")
        private String id;
        private String name;
        private String email;
    }

    @Data
    @Builder
    public static class CollaboratorDto {
        private UserDto user;
        private String role;
        private LocalDateTime addedAt;
    }

    @Data
    @Builder
    public static class PendingCollaboratorDto {
        private String email;
        private String role;
        private LocalDateTime invitedAt;
    }
}
