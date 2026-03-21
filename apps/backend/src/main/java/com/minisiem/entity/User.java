package com.minisiem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="users") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false, unique=true) private String username;
    @Column(nullable=false, unique=true) private String email;
    @Column(name="password_hash", nullable=false) private String passwordHash;
    private String fullName;
    @Column(nullable=false) private String role;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="tenant_id") private Tenant tenant;
    @Column(nullable=false) private Boolean isActive = true;
    @CreationTimestamp private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}