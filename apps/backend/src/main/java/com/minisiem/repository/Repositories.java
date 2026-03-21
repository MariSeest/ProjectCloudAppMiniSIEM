package com.minisiem.repository;

import com.minisiem.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository public interface TenantRepository extends JpaRepository<Tenant,UUID> { Optional<Tenant> findBySlug(String slug); }
@Repository public interface UserRepository extends JpaRepository<User,UUID> {
    Optional<User> findByUsername(String u);
    Optional<User> findByEmail(String e);
    List<User> findAllByTenantId(UUID t);
}
@Repository public interface EventRepository extends JpaRepository<Event,UUID> {
    Page<Event> findAllByTenantIdOrderByTimestampDesc(UUID t, Pageable p);
    long countByTenantId(UUID t);
}
@Repository public interface AlertRepository extends JpaRepository<Alert,UUID> {
    Page<Alert> findAllByTenantIdOrderByCreatedAtDesc(UUID t, Pageable p);
    long countByTenantIdAndStatus(UUID t, String s);
    long countByTenantId(UUID t);
}
@Repository public interface IncidentRepository extends JpaRepository<Incident,UUID> {
    @Query("SELECT i FROM Incident i WHERE i.tenant.id=:t AND i.archived=false ORDER BY i.createdAt DESC")
    List<Incident> findActiveByTenantId(@Param("t") UUID t);
    @Query("SELECT i FROM Incident i WHERE i.tenant.id=:t AND i.archived=true ORDER BY i.archivedAt DESC")
    List<Incident> findArchivedByTenantId(@Param("t") UUID t);
    long countByTenantIdAndStatusAndArchived(UUID t, String s, Boolean a);
}
@Repository public interface IncidentCorrelationRepository extends JpaRepository<IncidentCorrelation,UUID> {
    @Query("SELECT c FROM IncidentCorrelation c WHERE c.tenant.id=:t AND (c.incident1.id=:i OR c.incident2.id=:i)")
    List<IncidentCorrelation> findByIncidentId(@Param("t") UUID t, @Param("i") UUID i);
    @Query("SELECT c FROM IncidentCorrelation c WHERE c.tenant.id=:t")
    List<IncidentCorrelation> findAllByTenantId(@Param("t") UUID t);
    void deleteByIncident1IdOrIncident2Id(UUID a, UUID b);
}
@Repository public interface CommentRepository extends JpaRepository<Comment,UUID> {
    List<Comment> findAllByEntityTypeAndEntityIdOrderByCreatedAtAsc(String t, UUID id);
}
@Repository public interface AuditLogRepository extends JpaRepository<AuditLog,UUID> {
    Page<AuditLog> findAllByTenantIdOrderByTimestampDesc(UUID t, Pageable p);
    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    Page<AuditLog> findAllOrderByTimestampDesc(Pageable p);
}
@Repository public interface AcnReportRepository extends JpaRepository<AcnReport,UUID> {
    List<AcnReport> findAllByTenantIdOrderByCreatedAtDesc(UUID t);
}
@Repository public interface FalxdrEndpointRepository extends JpaRepository<FalxdrEndpoint,UUID> {
    List<FalxdrEndpoint> findAllByTenantIdOrderByHostname(UUID t);
}
@Repository public interface FalxdrApplicationRepository extends JpaRepository<FalxdrApplication,UUID> {
    List<FalxdrApplication> findAllByEndpointIdAndIsInstalledTrue(UUID id);
}
@Repository public interface FalxdrLoginHistoryRepository extends JpaRepository<FalxdrLoginHistory,UUID> {
    List<FalxdrLoginHistory> findAllByEndpointIdOrderByLoginTimeDesc(UUID id);
}
@Repository public interface FalxdrCommandRepository extends JpaRepository<FalxdrCommand,UUID> {
    List<FalxdrCommand> findAllByEndpointIdOrderByExecutedAtDesc(UUID id);
}
@Repository public interface FalxdrBrowserHistoryRepository extends JpaRepository<FalxdrBrowserHistory,UUID> {
    List<FalxdrBrowserHistory> findTop20ByEndpointIdOrderByVisitedAtDesc(UUID id);
}
@Repository public interface IdentityAssetRepository extends JpaRepository<IdentityAsset,UUID> {
    List<IdentityAsset> findAllByTenantIdOrderByPasswordStrengthAsc(UUID t);
}