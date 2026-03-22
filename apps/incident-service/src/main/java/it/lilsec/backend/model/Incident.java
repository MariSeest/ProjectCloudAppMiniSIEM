package it.lilsec.backend.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private IncidentStatus status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "incident_cves", joinColumns = @JoinColumn(name = "incident_id", referencedColumnName = "id"))
    @Column(name = "cve_id", nullable = false, length = 40)
    private List<String> cveIds = new ArrayList<>();

    @Column(name = "taken_charge_at")
    private Instant takenChargeAt;

    @Column(name = "taken_charge_by")
    private String takenChargeBy;

    @Column(name = "taken_charge_duration_minutes")
    private Integer takenChargeDurationMinutes;

    @Column(nullable = false)
    private boolean archived = false;

    @Column(name = "archived_at")
    private Instant archivedAt;

    @Column(name = "archived_by")
    private String archivedBy;

    public Incident() {}

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
    public void setCveIds(List<String> cveIds) { this.cveIds = cveIds == null ? new ArrayList<>() : cveIds; }
    public Instant getTakenChargeAt() { return takenChargeAt; }
    public void setTakenChargeAt(Instant takenChargeAt) { this.takenChargeAt = takenChargeAt; }
    public String getTakenChargeBy() { return takenChargeBy; }
    public void setTakenChargeBy(String takenChargeBy) { this.takenChargeBy = takenChargeBy; }
    public Integer getTakenChargeDurationMinutes() { return takenChargeDurationMinutes; }
    public void setTakenChargeDurationMinutes(Integer takenChargeDurationMinutes) { this.takenChargeDurationMinutes = takenChargeDurationMinutes; }
    public boolean isArchived() { return archived; }
    public void setArchived(boolean archived) { this.archived = archived; }
    public Instant getArchivedAt() { return archivedAt; }
    public void setArchivedAt(Instant archivedAt) { this.archivedAt = archivedAt; }
    public String getArchivedBy() { return archivedBy; }
    public void setArchivedBy(String archivedBy) { this.archivedBy = archivedBy; }
}