package com.minisiem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.*;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.*;

@Entity @Table(name="events") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class Event {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @Column(nullable=false) private String title;
    private String source;
    @Column(nullable=false) private String severity;
    @Column(columnDefinition="TEXT") private String description;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb") private Map<String,Object> rawData;
    private LocalDateTime timestamp;
    @CreationTimestamp private LocalDateTime createdAt;
}

@Entity @Table(name="alerts") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class Alert {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @Column(nullable=false) private String title;
    @Column(nullable=false) private String severity;
    @Column(nullable=false) private String status;
    @Column(columnDefinition="TEXT") private String description;
    private String source;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="assigned_to") private User assignedTo;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
}

@Entity @Table(name="comments") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class Comment {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false) private String entityType;
    @Column(nullable=false) private UUID entityId;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="author_id",nullable=false) private User author;
    @Column(nullable=false,columnDefinition="TEXT") private String content;
    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;
}

@Entity @Table(name="audit_logs") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class AuditLog {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id") private Tenant tenant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user;
    private String username;
    @Column(nullable=false) private String action;
    private String entityType;
    private UUID entityId;
    @JdbcTypeCode(SqlTypes.JSON) @Column(columnDefinition="jsonb") private Map<String,Object> details;
    private String ipAddress;
    @CreationTimestamp private LocalDateTime timestamp;
}

@Entity @Table(name="incident_correlations") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class IncidentCorrelation {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="incident_id_1",nullable=false) private Incident incident1;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="incident_id_2",nullable=false) private Incident incident2;
    @Column(nullable=false) private String correlationType;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="created_by") private User createdBy;
    @CreationTimestamp private LocalDateTime createdAt;
}