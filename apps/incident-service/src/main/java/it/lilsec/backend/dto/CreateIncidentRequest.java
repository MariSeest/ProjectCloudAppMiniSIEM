package it.lilsec.backend.dto;

import it.lilsec.backend.model.Severity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateIncidentRequest(
        @NotBlank @Size(max = 120) String title,
        @Size(max = 2000) String description,
        @NotNull Severity severity,
        @Size(max = 50) List<@Size(max = 40) String> cveIds
) {}
