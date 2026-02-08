package it.lilsec.backend.dto;

import it.lilsec.backend.model.Severity;

import java.time.Instant;
import java.util.List;

public record IncidentResponse(
        String id,
        String title,
        String description,
        Severity severity,
        String status,
        List<String> cveIds,
        Instant createdAt
) {}
