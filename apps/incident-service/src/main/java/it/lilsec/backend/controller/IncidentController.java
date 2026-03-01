package it.lilsec.backend.controller;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.dto.IncidentPatchRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.service.IncidentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService service;

    public IncidentController(IncidentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Incident> list(@RequestParam(required = false) String cveId) {
        if (cveId != null && !cveId.isBlank()) {
            return service.findByCveId(cveId.trim());
        }
        return service.list();
    }

    @GetMapping("/{id}")
    public Incident get(@PathVariable String id) {
        return service.get(id);
    }

    @PostMapping
    public Incident create(@RequestBody CreateIncidentRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public Incident update(@PathVariable String id, @RequestBody UpdateIncidentRequest req) {
        return service.update(id, req);
    }

    @PatchMapping("/{id}")
    public Incident patch(@PathVariable String id, @RequestBody IncidentPatchRequest req) {
        return service.patch(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}