package it.lilsec.backend.controller;

import it.lilsec.backend.dto.CreateIncidentRequest;
import it.lilsec.backend.dto.UpdateIncidentRequest;
import it.lilsec.backend.model.Incident;
import it.lilsec.backend.service.IncidentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public List<Incident> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public Incident get(@PathVariable String id) {
        return service.get(id);
    }

    @GetMapping("/by-cve/{cveId}")
    public List<Incident> byCve(@PathVariable String cveId) {
        return service.findByCveId(cveId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Incident create(@Valid @RequestBody CreateIncidentRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public Incident update(@PathVariable String id, @RequestBody UpdateIncidentRequest req) {
        return service.update(id, req);
    }

    @PatchMapping("/{id}")
    public Incident patch(@PathVariable String id, @RequestBody UpdateIncidentRequest req) {
        return service.patch(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        service.delete(id);
    }
}
