package com.minisiem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.*;
import java.util.UUID;

@Entity @Table(name="falxdr_endpoints") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FalxdrEndpoint {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @Column(nullable=false) private String hostname;
    private String ipAddress, macAddress, os, osVersion, hardwareModel, cpu;
    private Integer ramGb, diskGb;
    private String agentVersion, agentStatus;
    private LocalDateTime lastSeen;
    @CreationTimestamp private LocalDateTime createdAt;
}

@Entity @Table(name="falxdr_applications") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class FalxdrApplication {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="endpoint_id",nullable=false) private FalxdrEndpoint endpoint;
    @Column(nullable=false) private String name;
    private String version, publisher;
    private LocalDate installDate;
    @Column(nullable=false) private Boolean isInstalled = true;
}

@Entity @Table(name="falxdr_login_history") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class FalxdrLoginHistory {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="endpoint_id",nullable=false) private FalxdrEndpoint endpoint;
    @Column(nullable=false) private String username;
    @Column(nullable=false) private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private String loginType;
}

@Entity @Table(name="falxdr_commands") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class FalxdrCommand {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="endpoint_id",nullable=false) private FalxdrEndpoint endpoint;
    private String username;
    @Column(nullable=false,columnDefinition="TEXT") private String command;
    @Column(nullable=false) private LocalDateTime executedAt;
}

@Entity @Table(name="falxdr_browser_history") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class FalxdrBrowserHistory {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="endpoint_id",nullable=false) private FalxdrEndpoint endpoint;
    @Column(nullable=false,columnDefinition="TEXT") private String url;
    private String title;
    @Column(nullable=false) private LocalDateTime visitedAt;
}

@Entity @Table(name="identity_assets") @Data @NoArgsConstructor @AllArgsConstructor @Builder
class IdentityAsset {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id",nullable=false) private Tenant tenant;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="endpoint_id") private FalxdrEndpoint endpoint;
    @Column(nullable=false) private String username;
    private String fullName, passwordStrength;
    private LocalDateTime lastPasswordChange;
    @Column(nullable=false) private Boolean forceResetRequested = false;
    private LocalDateTime forceResetAt;
}