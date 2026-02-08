package it.lilsec.backend.dto;

import java.time.Instant;
import java.util.List;

public record IncidentResponse(
        String id,
        String title,
        String description,
        Severity severity,
        Status status,
        List<String> cveIds,
        Instant createdAt
) {}
