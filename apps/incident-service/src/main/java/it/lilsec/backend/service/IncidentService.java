package it.lilsec.backend.service;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class IncidentService {

    private final IncidentRepository repo;

    public IncidentService(IncidentRepository repo) {
        this.repo = repo;
    }

    public List<Incident> list() {
        return repo.findAll()
                .stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    public Incident get(String id) {
        return repo.findById(id).orElseThrow(() -> new NoSuchElementException("Incident not found: " + id));
    }

    public Incident create(CreateIncidentRequest req) {
        String id = UUID.randomUUID().toString();
        Instant now = Instant.now();

        Incident inc = new Incident();
        inc.setId(id);
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(req.severity());
        inc.setStatus(IncidentStatus.OPEN);
        inc.setCreatedAt(now);
        inc.setUpdatedAt(now);

        if (req.cveIds() != null) inc.setCveIds(new HashSet<>(req.cveIds()));

        return repo.save(inc);
    }

    public Incident update(String id, UpdateIncidentRequest req) {
        Incident inc = get(id);

        if (req.title() != null) inc.setTitle(req.title());
        if (req.description() != null) inc.setDescription(req.description());
        if (req.severity() != null) inc.setSeverity(req.severity());   // usa enum DTO coerente al model
        if (req.status() != null) inc.setStatus(req.status());         // idem
        if (req.cveIds() != null) inc.setCveIds(new HashSet<>(req.cveIds()));

        inc.setUpdatedAt(Instant.now());
        return repo.save(inc);
    }

    public void delete(String id) {
        repo.deleteById(id);
    }

    public List<Incident> findByCveId(String cveId) {
        return repo.findByCveId(cveId);
    }
}
