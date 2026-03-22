package it.lilsec.siem.repository;

import it.lilsec.siem.entity.FalxdrEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FalxdrEndpointRepository extends JpaRepository<FalxdrEndpoint, UUID> {
    List<FalxdrEndpoint> findAllByTenantIdOrderByHostname(String tenantId);
}