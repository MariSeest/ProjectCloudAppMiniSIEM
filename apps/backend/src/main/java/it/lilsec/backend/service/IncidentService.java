package it.lilsec.backend.service;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.model.Severity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IncidentService {

    private final Map<String, Incident> store = new ConcurrentHashMap<>();

    public List<Incident> list() {
        return store.values().stream()
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    public Incident get(String id) {
        Incident inc = store.get(id);
        if (inc == null) throw new NoSuchElementException("Incident not found: " + id);
        return inc;
    }

    public Incident create(CreateIncidentRequest req) {
        String id = UUID.randomUUID().toString();
        Instant now = Instant.now();

        Incident inc = new Incident();
        inc.setId(id);
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(parseSeverity(req.severity()));
        inc.setStatus(IncidentStatus.OPEN);
        inc.setCreatedAt(now);
        inc.setUpdatedAt(now);
        inc.setCveIds(req.cveIds() == null ? new ArrayList<>() : new ArrayList<>(req.cveIds()));

        store.put(id, inc);
        return inc;
    }

    public Incident update(String id, UpdateIncidentRequest req) {
        Incident inc = get(id);

        if (req.title() != null) inc.setTitle(req.title());
        if (req.description() != null) inc.setDescription(req.description());
        if (req.severity() != null) inc.setSeverity(parseSeverity(req.severity()));
        if (req.status() != null) inc.setStatus(parseStatus(req.status()));
        if (req.cveIds() != null) inc.setCveIds(new ArrayList<>(req.cveIds()));

        inc.setUpdatedAt(Instant.now());
        return inc;
    }

    public void delete(String id) {
        store.remove(id);
    }

    public List<Incident> findByCveId(String cveId) {
        return store.values().stream()
                .filter(i -> i.getCveIds() != null && i.getCveIds().contains(cveId))
                .sorted(Comparator.comparing(Incident::getCreatedAt).reversed())
                .toList();
    }

    private Severity parseSeverity(String s) {
        if (s == null || s.isBlank()) return Severity.UNKNOWN;
        try { return Severity.valueOf(s.trim().toUpperCase()); }
        catch (Exception e) { return Severity.UNKNOWN; }
    }

    private IncidentStatus parseStatus(String s) {
        if (s == null || s.isBlank()) return IncidentStatus.OPEN;
        try { return IncidentStatus.valueOf(s.trim().toUpperCase()); }
        catch (Exception e) { return IncidentStatus.OPEN; }
    }
}
