package com.eia.racingleague.service;

import com.eia.racingleague.dto.audit.AuditLogResponse;
import com.eia.racingleague.model.AuditLog;
import com.eia.racingleague.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(String action, String entityType, String entityId, String description) {
        save(currentUsername(), action, entityType, entityId, description, null, null);
    }

    @Transactional
    public void log(String action, String entityType, String entityId, String description,
                    String previousValue, String newValue) {
        save(currentUsername(), action, entityType, entityId, description, previousValue, newValue);
    }

    @Transactional
    public void logWithUser(String username, String action, String entityType,
                            String entityId, String description) {
        save(username, action, entityType, entityId, description, null, null);
    }

    private void save(String username, String action, String entityType, String entityId,
                      String description, String previousValue, String newValue) {
        AuditLog log = AuditLog.builder()
                .username(username)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .description(description)
                .previousValue(previousValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(log);
    }

    private String currentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null && auth.isAuthenticated()) ? auth.getName() : "system";
    }

    public Page<AuditLogResponse> findAll(Pageable pageable) {
        return auditLogRepository.findAllByOrderByOccurredAtDesc(pageable).map(this::toResponse);
    }

    private AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .username(a.getUsername())
                .action(a.getAction())
                .entityType(a.getEntityType())
                .entityId(a.getEntityId())
                .occurredAt(a.getOccurredAt())
                .description(a.getDescription())
                .previousValue(a.getPreviousValue())
                .newValue(a.getNewValue())
                .build();
    }
}