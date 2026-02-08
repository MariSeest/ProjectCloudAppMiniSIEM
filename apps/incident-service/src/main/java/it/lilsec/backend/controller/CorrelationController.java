package it.lilsec.backend.controller;

import it.lilsec.backend.model.Incident;
import it.lilsec.backend.service.IncidentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/correlation")
public class CorrelationController {

    private final IncidentService incidentService;

    public CorrelationController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping("/cve/{cveId}")
    public List<Incident> incidentsByCve(@PathVariable String cveId) {
        return incidentService.findByCveId(cveId);
    }
}
