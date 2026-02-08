package it.lilsec.backend.model;

import java.time.Instant;
import java.util.List;

public class Incident {
    private String id;
    private String title;
    private String description;
    private Severity severity;
    private IncidentStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    // Correlazione: lista di CVE IDs collegati (es. ["CVE-2024-1234", ...])
    private List<String> cveIds;

    public Incident() {}

    public Incident(String id, String title, String description, Severity severity,
                    IncidentStatus status, Instant createdAt, Instant updatedAt, List<String> cveIds) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.cveIds = cveIds;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<String> getCveIds() { return cveIds; }
    public void setCveIds(List<String> cveIds) { this.cveIds = cveIds; }
}
