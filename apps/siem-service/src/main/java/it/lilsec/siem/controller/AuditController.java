package it.lilsec.siem.controller;

import it.lilsec.siem.entity.AuditLog;
import it.lilsec.siem.repository.AuditLogRepository;
import org.springframework.data.domain.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditLogRepository auditRepo;

    public AuditController(AuditLogRepository auditRepo) {
        this.auditRepo = auditRepo;
    }

    @GetMapping
    public Page<AuditLog> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String tenantId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities()
            .contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        Pageable pageable = PageRequest.of(page, size);
        if (isAdmin && tenantId == null)
            return auditRepo.findAllOrderByTimestampDesc(pageable);
        return auditRepo.findAllByTenantIdOrderByTimestampDesc(
            tenantId != null ? tenantId : "00000000-0000-0000-0000-000000000002", pageable);
    }
}