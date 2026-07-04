package com.docsmaster.server.dto;

import com.docsmaster.server.models.Collaborator;
import com.docsmaster.server.models.Document;
import com.docsmaster.server.models.PendingCollaborator;
import com.docsmaster.server.models.User;

import java.util.stream.Collectors;

public class DocumentMapper {

    public static DocumentDto toDto(Document document) {
        if (document == null) {
            return null;
        }

        return DocumentDto.builder()
                .id(document.getId())
                .title(document.getTitle())
                .content(document.getContent())
                .tags(document.getTags())
                .keywords(document.getKeywords())
                .subject(document.getSubject())
                .user(toUserDto(document.getUser()))
                .collaborators(document.getCollaborators() != null ? document.getCollaborators().stream()
                        .map(DocumentMapper::toCollaboratorDto)
                        .collect(Collectors.toList()) : null)
                .pendingCollaborators(document.getPendingCollaborators() != null ? document.getPendingCollaborators().stream()
                        .map(DocumentMapper::toPendingCollaboratorDto)
                        .collect(Collectors.toList()) : null)
                .shareCode(document.getShareCode())
                .isShared(document.getIsShared())
                .selectionTime(document.getSelectionTime())
                .modifiedBy(toUserDto(document.getModifiedBy()))
                .createdAt(document.getCreatedAt())
                .updatedAt(document.getUpdatedAt())
                .build();
    }

    public static DocumentDto.UserDto toUserDto(User user) {
        if (user == null) {
            return null;
        }
        return DocumentDto.UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }

    public static DocumentDto.CollaboratorDto toCollaboratorDto(Collaborator collaborator) {
        if (collaborator == null) {
            return null;
        }
        return DocumentDto.CollaboratorDto.builder()
                .user(toUserDto(collaborator.getUser()))
                .role(collaborator.getRole())
                .addedAt(collaborator.getAddedAt())
                .build();
    }

    public static DocumentDto.PendingCollaboratorDto toPendingCollaboratorDto(PendingCollaborator pending) {
        if (pending == null) {
            return null;
        }
        return DocumentDto.PendingCollaboratorDto.builder()
                .email(pending.getEmail())
                .role(pending.getRole())
                .invitedAt(pending.getInvitedAt())
                .build();
    }
}
