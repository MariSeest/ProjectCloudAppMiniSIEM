package it.lilsec.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record CorrelationResponse(
    UUID id,
    UUID incidentId1,
    String incidentTitle1,
    UUID incidentId2,
    String incidentTitle2,
    String correlationType,
    String createdBy,
    Instant createdAt
) {}