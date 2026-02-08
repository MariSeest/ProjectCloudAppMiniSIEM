package it.lilsec.backend.dto;

public record CveDto(
        String cveId,
        String description,
        String severity,
        Integer score,
        String created,
        String modified,
        String externalUrl
) {}