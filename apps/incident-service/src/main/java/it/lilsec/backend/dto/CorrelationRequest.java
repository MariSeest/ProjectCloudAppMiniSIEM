package it.lilsec.backend.dto;

import java.util.UUID;

public record CorrelationRequest(
    UUID incidentId1,
    UUID incidentId2,
    String correlationType,
    String createdBy
) {}