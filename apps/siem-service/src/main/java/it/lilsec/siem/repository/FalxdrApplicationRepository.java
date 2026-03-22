package it.lilsec.siem.repository;

import it.lilsec.siem.entity.FalxdrApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FalxdrApplicationRepository extends JpaRepository<FalxdrApplication, UUID> {
    List<FalxdrApplication> findAllByEndpointIdAndIsInstalledTrue(UUID endpointId);
}