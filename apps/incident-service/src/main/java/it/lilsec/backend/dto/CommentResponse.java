package it.lilsec.backend.dto;

import java.time.Instant;
import java.util.UUID;

public record CommentResponse(
    UUID id,
    UUID incidentId,
    String authorUsername,
    String authorName,
    String content,
    Instant createdAt
) {}