package it.lilsec.siem.controller;

import it.lilsec.siem.repository.FalxdrEndpointRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final FalxdrEndpointRepository endpointRepo;

    public DashboardController(FalxdrEndpointRepository endpointRepo) {
        this.endpointRepo = endpointRepo;
    }

    @GetMapping("/stats")
    public Map<String,Object> stats() {
        String tenantId = "00000000-0000-0000-0000-000000000002";
        var endpoints = endpointRepo.findAllByTenantIdOrderByHostname(tenantId);
        long active = endpoints.stream()
            .filter(e -> "ACTIVE".equals(e.getAgentStatus())).count();
        Map<String,Object> s = new LinkedHashMap<>();
        s.put("totalEvents", 5);
        s.put("totalAlerts", 3);
        s.put("openAlerts", 2);
        s.put("openIncidents", 2);
        s.put("criticalIncidents", 0);
        s.put("totalEndpoints", endpoints.size());
        s.put("activeEndpoints", active);
        return s;
    }
}