package it.lilsec.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "incident_correlations")
public class IncidentCorrelation {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id_1", nullable = false)
    private Incident incident1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "incident_id_2", nullable = false)
    private Incident incident2;

    @Column(nullable = false)
    private String correlationType;

    private String createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
        if (createdAt == null) createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Incident getIncident1() { return incident1; }
    public void setIncident1(Incident incident1) { this.incident1 = incident1; }
    public Incident getIncident2() { return incident2; }
    public void setIncident2(Incident incident2) { this.incident2 = incident2; }
    public String getCorrelationType() { return correlationType; }
    public void setCorrelationType(String correlationType) { this.correlationType = correlationType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}