package it.lilsec.backend.repository;

import it.lilsec.backend.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    @Query("SELECT DISTINCT i FROM Incident i JOIN i.cveIds c WHERE c = :cveId")
    List<Incident> findByCveId(@Param("cveId") String cveId);

    List<Incident> findAllByArchivedFalseOrderByCreatedAtDesc();

    List<Incident> findAllByArchivedTrueOrderByArchivedAtDesc();
}