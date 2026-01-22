package it.lilsec.backend.dto;

import java.util.List;

public record UpdateIncidentRequest(
        String title,
        String description,
        String severity,
        String status,     // "OPEN|INVESTIGATING|CONTAINED|RESOLVED"
        List<String> cveIds
) {}
