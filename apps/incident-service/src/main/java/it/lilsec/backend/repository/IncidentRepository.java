package it.lilsec.backend.repository;

import it.lilsec.backend.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    @Query("""
        select distinct i
        from Incident i
        join i.cveIds c
        where c = :cveId
    """)
    List<Incident> findByCveId(@Param("cveId") String cveId);
}
