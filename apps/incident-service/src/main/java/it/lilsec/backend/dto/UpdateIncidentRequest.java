package it.lilsec.backend.dto;

import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.model.Severity;

import java.util.List;

public record UpdateIncidentRequest(
        String title,
        String description,
        Severity severity,
        IncidentStatus status,
        List<String> cveIds
) {}
