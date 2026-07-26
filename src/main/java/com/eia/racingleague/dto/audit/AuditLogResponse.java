package com.eia.racingleague.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String username;
    private String action;
    private String entityType;
    private String entityId;
    private LocalDateTime occurredAt;
    private String description;
    private String previousValue;
    private String newValue;
}