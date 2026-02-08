package it.lilsec.backend.service;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
public class IncidentService {

    private final IncidentRepository repo;

    public IncidentService(IncidentRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Incident> list() {
        // se vuoi ordine DB-side, lo facciamo con Sort
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

    @Transactional
    public Incident create(CreateIncidentRequest req) {
        Incident inc = new Incident();
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(req.severity());
        inc.setStatus(it.lilsec.backend.model.IncidentStatus.OPEN);
        inc.setCveIds(req.cveIds() == null ? List.of() : List.copyOf(req.cveIds()));
        return repo.save(inc);
    }

    /**
     * PUT "tollerante": aggiorna i campi valorizzati (se vuoi PUT strict = sostituzione completa, dimmelo e lo imposto)
     */
    @Transactional
    public Incident update(String id, UpdateIncidentRequest req) {
        Incident inc = get(id);

        if (req.title() != null) inc.setTitle(req.title());
        if (req.description() != null) inc.setDescription(req.description());
        if (req.severity() != null) inc.setSeverity(req.severity());
        if (req.status() != null) inc.setStatus(req.status());
        if (req.cveIds() != null) inc.setCveIds(List.copyOf(req.cveIds()));

        return repo.save(inc);
    }

    /**
     * PATCH: identico alla logica di update, ma semanticamente "parziale".
     * Se vuoi differenziarlo, qui si può anche applicare JSON Merge Patch.
     */
    @Transactional
    public Incident patch(String id, UpdateIncidentRequest req) {
        return update(id, req);
    }

    @Transactional
    public void delete(String id) {
        UUID uuid = parseUuid(id);
        repo.deleteById(uuid);
    }

    @Transactional(readOnly = true)
    public List<Incident> findByCveId(String cveId) {
        return repo.findByCveIdsContaining(cveId).stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    private UUID parseUuid(String id) {
        try {
            return UUID.fromString(id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid incident id (expected UUID): " + id);
        }
    }
}
