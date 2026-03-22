package it.lilsec.backend.dto;

public record TakeChargeRequest(
    String username,
    Integer durationMinutes
) {}