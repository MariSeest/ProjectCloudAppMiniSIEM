package it.lilsec.siem.repository;

import it.lilsec.siem.entity.AcnReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface AcnReportRepository extends JpaRepository<AcnReport, UUID> {
    List<AcnReport> findAllByTenantIdOrderByCreatedAtDesc(String tenantId);
}