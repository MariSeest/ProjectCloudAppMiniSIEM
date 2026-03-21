package com.minisiem.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name="tenants") @Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(nullable=false, unique=true) private String name;
    @Column(nullable=false, unique=true) private String slug;
    @CreationTimestamp private LocalDateTime createdAt;
}