package it.lilsec.backend.repository;

import it.lilsec.backend.model.Incident;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IncidentRepository extends JpaRepository<Incident, UUID> {

    // comodo se vuoi cercare incidenti che contengono un CVE in lista
    List<Incident> findByCveIdsContaining(String cveId);
}
