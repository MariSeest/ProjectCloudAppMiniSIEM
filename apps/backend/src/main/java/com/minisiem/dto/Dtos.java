package com.minisiem.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginRequest { private String username, password; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token; private UUID userId, tenantId;
    private String username, fullName, role, tenantName;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateUserRequest {
    private String username, email, password, fullName, role; private UUID tenantId;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateUserRequest {
    private String fullName, role, password; private Boolean isActive; private UUID tenantId;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDto {
    private UUID id, tenantId; private String username, email, fullName, role, tenantName;
    private Boolean isActive; private LocalDateTime lastLogin, createdAt;
}

@Data @AllArgsConstructor @NoArgsConstructor
public class TenantDto { private UUID id; private String name, slug; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IncidentDto {
    private UUID id; private String title, severity, status, description;
    private String[] cveIds; private UUID assignedTo; private String assignedToName;
    private LocalDateTime takenChargeAt; private String takenChargeByName;
    private Integer takenChargeDurationMinutes; private Boolean archived;
    private LocalDateTime archivedAt, createdAt, updatedAt;
    private List<CorrelationDto> correlations;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateIncidentRequest { private String title, severity, description; private String[] cveIds; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UpdateIncidentRequest { private String title, severity, status, description; private String[] cveIds; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CorrelationRequest { private UUID incidentId1, incidentId2; private String correlationType; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CorrelationDto {
    private UUID id, incidentId1, incidentId2; private String incidentTitle1, incidentTitle2;
    private String correlationType, createdByName; private LocalDateTime createdAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EventDto {
    private UUID id; private String title, source, severity, description;
    private LocalDateTime timestamp, createdAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AlertDto {
    private UUID id; private String title, severity, status, description, source;
    private UUID assignedTo; private String assignedToName;
    private LocalDateTime createdAt, updatedAt, resolvedAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CommentDto {
    private UUID id, entityId, authorId; private String entityType, authorName, authorUsername, content;
    private LocalDateTime createdAt, updatedAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreateCommentRequest { private String content; }

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStatsDto {
    private long totalEvents, totalAlerts, openAlerts, openIncidents, criticalIncidents, totalEndpoints, activeEndpoints;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AcnReportDto {
    private UUID id, incidentId; private String notificationId, status, notificationType;
    private Map<String,Object> sectionA,sectionB,sectionC,sectionD,sectionE,sectionF,sectionG,sectionH,sectionI,sectionL;
    private LocalDateTime createdAt, updatedAt, submittedAt;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EndpointDto {
    private UUID id; private String hostname, ipAddress, macAddress, os, osVersion;
    private String hardwareModel, cpu, agentVersion, agentStatus;
    private Integer ramGb, diskGb; private LocalDateTime lastSeen;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TakeChargeRequest { private Integer durationMinutes; }