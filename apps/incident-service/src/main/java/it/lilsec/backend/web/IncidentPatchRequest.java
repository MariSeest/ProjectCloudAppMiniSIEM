package it.lilsec.backend.web;

import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.model.Severity;

import java.util.List;

/**
 * DTO per PATCH: tutti i campi sono opzionali.
 * Se null => non modifica quel campo.
 */
public record IncidentPatchRequest(
        String title,
        String description,
        Severity severity,
        IncidentStatus status,
        List<String> cveIds
) {}