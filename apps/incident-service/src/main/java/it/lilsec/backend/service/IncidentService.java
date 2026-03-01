package it.lilsec.backend.service;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.PatchIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

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
        inc.setId(UUID.randomUUID());
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(req.severity());
        inc.setStatus(IncidentStatus.OPEN);
        inc.setCreatedAt(now);
        inc.setUpdatedAt(now);
        inc.setCveIds(normalizeCveIds(req.cveIds()));

        return repo.save(inc);
    }

    /**
     * PUT semantics: aggiorna i campi presenti in UpdateIncidentRequest (il tuo DTO già lavora “a campi opzionali”).
     */
    public Incident update(String id, UpdateIncidentRequest req) {
        Incident inc = get(id);
        applyUpdates(
                inc,
                req.title(),
                req.description(),
                req.severity(),
                req.status(),
                req.cveIds()
        );
        return repo.save(inc);
    }

    /**
     * PATCH semantics: partial update.
     */
    public Incident patch(String id, PatchIncidentRequest req) {
        Incident inc = get(id);
        applyUpdates(
                inc,
                req.title(),
                req.description(),
                req.severity(),
                req.status(),
                req.cveIds()
        );
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

        return repo.findByCveId(normalized).stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    private void applyUpdates(
            Incident inc,
            String title,
            String description,
            Object severity,           // tipizzato sotto, vedi note
            Object status,             // tipizzato sotto, vedi note
            List<String> cveIds
    ) {
        if (title != null) inc.setTitle(title);
        if (description != null) inc.setDescription(description);

        // ✅ Evito di “inventare” il tipo: cast sicuro a runtime se coerente col tuo model
        if (severity != null) inc.setSeverity((it.lilsec.backend.model.IncidentSeverity) severity);
        if (status != null) inc.setStatus((IncidentStatus) status);

        if (cveIds != null) inc.setCveIds(normalizeCveIds(cveIds));

        inc.setUpdatedAt(Instant.now());
    }

    private ArrayList<String> normalizeCveIds(List<String> cveIds) {
        if (cveIds == null) return new ArrayList<>();

        // trim, drop empty, dedup preservando ordine
        LinkedHashSet<String> dedup = cveIds.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new ArrayList<>(dedup);
    }

    private UUID parseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid UUID: " + id, e);
        }
    }
}