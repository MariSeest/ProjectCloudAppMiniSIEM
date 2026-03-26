package it.lilsec.siem.repository;

import it.lilsec.siem.entity.Alert;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {
    Page<Alert> findAllByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);
    long countByTenantIdAndStatus(String tenantId, String status);
}