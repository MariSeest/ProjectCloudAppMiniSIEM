package com.minisiem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="incidents") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Incident {
    @Id @Column(columnDefinition="UUID") private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String severity;
    @Column(nullable=false) private String status;
    @Column(columnDefinition="TEXT") private String description;
    @Column(name="cve_ids",columnDefinition="TEXT[]") private String[] cveIds;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="assigned_to") private User assignedTo;
    private LocalDateTime takenChargeAt;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="taken_charge_by") private User takenChargeBy;
    private Integer takenChargeDurationMinutes;
    @Column(nullable=false) private Boolean archived = false;
    private LocalDateTime archivedAt;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="archived_by") private User archivedBy;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;

    @PrePersist public void prePersist() { if (id==null) id=UUID.randomUUID(); }
}