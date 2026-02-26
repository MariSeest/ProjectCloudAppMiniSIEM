package it.lilsec.backend.service;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
public class IncidentService {

    private final IncidentRepository repo;

    public IncidentService(IncidentRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Incident> list() {
        return repo.findAll().stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    @Transactional(readOnly = true)
    public Incident get(String id) {
        UUID uuid = parseUuid(id);
        return repo.findById(uuid)
                .orElseThrow(() -> new NoSuchElementException("Incident not found: " + id));
    }

    public Incident create(CreateIncidentRequest req) {
        Instant now = Instant.now();

        Incident inc = new Incident();
        inc.setId(UUID.randomUUID()); // ✅ UUID coerente con entity
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(req.severity());
        inc.setStatus(IncidentStatus.OPEN);
        inc.setCreatedAt(now);
        inc.setUpdatedAt(now);
        inc.setCveIds(req.cveIds() == null ? new ArrayList<>() : new ArrayList<>(req.cveIds()));

        return repo.save(inc);
    }

    public Incident update(String id, UpdateIncidentRequest req) {
        Incident inc = get(id);

        if (req.title() != null) inc.setTitle(req.title());
        if (req.description() != null) inc.setDescription(req.description());
        if (req.severity() != null) inc.setSeverity(req.severity());
        if (req.status() != null) inc.setStatus(req.status());
        if (req.cveIds() != null) inc.setCveIds(new ArrayList<>(req.cveIds()));

        inc.setUpdatedAt(Instant.now());
        return repo.save(inc);
    }

    public void delete(String id) {
        UUID uuid = parseUuid(id);
        repo.deleteById(uuid);
    }

    @Transactional(readOnly = true)
    public List<Incident> findByCveId(String cveId) {
        String normalized = cveId == null ? "" : cveId.trim();
        if (normalized.isEmpty()) return List.of();

        // ✅ metodo esistente nel tuo IncidentRepository
        return repo.findByCveId(normalized).stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    private UUID parseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid UUID: " + id, e);
        }
    }
}