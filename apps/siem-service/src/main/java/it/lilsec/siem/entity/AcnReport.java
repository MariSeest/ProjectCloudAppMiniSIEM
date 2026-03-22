package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "siem_acn_reports")
public class AcnReport {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String tenantId;
    @Column(nullable = false) private String status;
    private String notificationType;
    private String createdBy;
    @Column(name = "section_a", columnDefinition = "TEXT") private String sectionA;
    @Column(name = "section_b", columnDefinition = "TEXT") private String sectionB;
    @Column(name = "section_c", columnDefinition = "TEXT") private String sectionC;
    @Column(name = "section_d", columnDefinition = "TEXT") private String sectionD;
    @Column(name = "section_e", columnDefinition = "TEXT") private String sectionE;
    @Column(name = "section_f", columnDefinition = "TEXT") private String sectionF;
    @Column(name = "section_g", columnDefinition = "TEXT") private String sectionG;
    @Column(name = "section_h", columnDefinition = "TEXT") private String sectionH;
    @Column(name = "section_i", columnDefinition = "TEXT") private String sectionI;
    @Column(name = "section_l", columnDefinition = "TEXT") private String sectionL;
    @Column(nullable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;
    private LocalDateTime submittedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }
    @PreUpdate
    public void preUpdate() { updatedAt = LocalDateTime.now(); }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotificationType() { return notificationType; }
    public void setNotificationType(String notificationType) { this.notificationType = notificationType; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getSectionA() { return sectionA; }
    public void setSectionA(String sectionA) { this.sectionA = sectionA; }
    public String getSectionB() { return sectionB; }
    public void setSectionB(String sectionB) { this.sectionB = sectionB; }
    public String getSectionC() { return sectionC; }
    public void setSectionC(String sectionC) { this.sectionC = sectionC; }
    public String getSectionD() { return sectionD; }
    public void setSectionD(String sectionD) { this.sectionD = sectionD; }
    public String getSectionE() { return sectionE; }
    public void setSectionE(String sectionE) { this.sectionE = sectionE; }
    public String getSectionF() { return sectionF; }
    public void setSectionF(String sectionF) { this.sectionF = sectionF; }
    public String getSectionG() { return sectionG; }
    public void setSectionG(String sectionG) { this.sectionG = sectionG; }
    public String getSectionH() { return sectionH; }
    public void setSectionH(String sectionH) { this.sectionH = sectionH; }
    public String getSectionI() { return sectionI; }
    public void setSectionI(String sectionI) { this.sectionI = sectionI; }
    public String getSectionL() { return sectionL; }
    public void setSectionL(String sectionL) { this.sectionL = sectionL; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
}