package it.lilsec.backend.repository;

import it.lilsec.backend.model.IncidentCorrelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface IncidentCorrelationRepository extends JpaRepository<IncidentCorrelation, UUID> {
    @Query("SELECT c FROM IncidentCorrelation c WHERE c.incident1.id = :id OR c.incident2.id = :id")
    List<IncidentCorrelation> findByIncidentId(@Param("id") UUID id);
    void deleteByIncident1IdOrIncident2Id(UUID id1, UUID id2);
}