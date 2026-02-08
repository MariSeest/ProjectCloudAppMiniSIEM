package it.lilsec.backend.model;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(length = 120, nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(length = 16, nullable = false)
    private IncidentStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ElementCollection
    @CollectionTable(name = "incident_cves", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "cve_id", length = 40, nullable = false)
    private List<String> cveIds = new ArrayList<>();

    public Incident() {}

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        if (id == null) id = UUID.randomUUID();
        if (status == null) status = IncidentStatus.OPEN;
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (cveIds == null) cveIds = new ArrayList<>();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

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
