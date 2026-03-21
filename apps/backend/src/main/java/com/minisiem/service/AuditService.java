package com.minisiem.service;

import com.minisiem.entity.AuditLog;
import com.minisiem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.*;

@Service @RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    @Async
    public void log(String username, UUID userId, UUID tenantId, String action,
                    String entityType, UUID entityId, Map<String,Object> details, String ip) {
        var log = AuditLog.builder().username(username).action(action)
            .entityType(entityType).entityId(entityId).details(details).ipAddress(ip).build();
        if (userId != null) userRepository.findById(userId).ifPresent(log::setUser);
        if (tenantId != null) tenantRepository.findById(tenantId).ifPresent(log::setTenant);
        auditLogRepository.save(log);
    }

    public Page<AuditLog> getLogsForTenant(UUID tenantId, Pageable p) {
        return auditLogRepository.findAllByTenantIdOrderByTimestampDesc(tenantId, p);
    }
    public Page<AuditLog> getAllLogs(Pageable p) {
        return auditLogRepository.findAllOrderByTimestampDesc(p);
    }
}