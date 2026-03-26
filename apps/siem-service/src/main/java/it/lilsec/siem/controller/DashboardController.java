package it.lilsec.siem.controller;

import it.lilsec.siem.repository.AlertRepository;
import it.lilsec.siem.repository.FalxdrEndpointRepository;
import it.lilsec.siem.repository.SiemEventRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private static final String TENANT = "00000000-0000-0000-0000-000000000002";

    private final FalxdrEndpointRepository endpointRepo;
    private final AlertRepository alertRepo;
    private final SiemEventRepository eventRepo;
    private final RestTemplate restTemplate;

    public DashboardController(FalxdrEndpointRepository endpointRepo,
                                AlertRepository alertRepo,
                                SiemEventRepository eventRepo) {
        this.endpointRepo = endpointRepo;
        this.alertRepo    = alertRepo;
        this.eventRepo    = eventRepo;
        this.restTemplate = new RestTemplate();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {

        // Endpoints dal DB
        var endpoints = endpointRepo.findAllByTenantIdOrderByHostname(TENANT);
        long totalEndpoints  = endpoints.size();
        long activeEndpoints = endpoints.stream()
            .filter(e -> "ACTIVE".equals(e.getAgentStatus())).count();

        // Alerts dal DB
        long totalAlerts = alertRepo.count();
        long openAlerts  = alertRepo.countByTenantIdAndStatus(TENANT, "OPEN");

        // Events dal DB
        long totalEvents = eventRepo.countByTenantId(TENANT);

        // Incidents dall'incident-service
        long openIncidents     = 0;
        long criticalIncidents = 0;
        try {
            Map[] incidents = restTemplate.getForObject(
                "http://incident-service:8082/api/incidents", Map[].class);
            if (incidents != null) {
                for (Map<?, ?> i : incidents) {
                    String status   = (String) i.get("status");
                    String severity = (String) i.get("severity");
                    if ("OPEN".equals(status) || "IN_PROGRESS".equals(status)) openIncidents++;
                    if ("CRITICAL".equals(severity) && !"RESOLVED".equals(status)) criticalIncidents++;
                }
            }
        } catch (Exception ignored) {}

        Map<String, Object> s = new LinkedHashMap<>();
        s.put("totalEvents",       totalEvents);
        s.put("totalAlerts",       totalAlerts);
        s.put("openAlerts",        openAlerts);
        s.put("openIncidents",     openIncidents);
        s.put("criticalIncidents", criticalIncidents);
        s.put("totalEndpoints",    totalEndpoints);
        s.put("activeEndpoints",   activeEndpoints);
        return s;
    }
}