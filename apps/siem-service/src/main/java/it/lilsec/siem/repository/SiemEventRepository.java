package it.lilsec.siem.repository;

import it.lilsec.siem.entity.SiemEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface SiemEventRepository extends JpaRepository<SiemEvent, UUID> {
    Page<SiemEvent> findAllByTenantIdOrderByTimestampDesc(String tenantId, Pageable pageable);
    long countByTenantId(String tenantId);
}