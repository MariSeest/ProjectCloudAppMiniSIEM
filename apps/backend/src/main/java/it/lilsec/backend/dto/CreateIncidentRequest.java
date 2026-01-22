package it.lilsec.backend.dto;

import java.util.List;

public record CreateIncidentRequest(
        String title,
        String description,
        String severity,   // "LOW|MEDIUM|HIGH|CRITICAL|UNKNOWN"
        List<String> cveIds
) {}
