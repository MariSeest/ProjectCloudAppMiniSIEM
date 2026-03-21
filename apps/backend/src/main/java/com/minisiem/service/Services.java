package com.minisiem.service;

import com.minisiem.dto.*;
import com.minisiem.entity.*;
import com.minisiem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final AuditService auditService;

    public Page<EventDto> getAll(UUID tenantId, int page, int size) {
        return eventRepository.findAllByTenantIdOrderByTimestampDesc(tenantId, PageRequest.of(page, size)).map(this::toDto);
    }
    public EventDto getById(UUID id) {
        return toDto(eventRepository.findById(id).orElseThrow());
    }
    private EventDto toDto(Event e) {
        return EventDto.builder().id(e.getId()).title(e.getTitle()).source(e.getSource())
            .severity(e.getSeverity()).description(e.getDescription())
            .timestamp(e.getTimestamp()).createdAt(e.getCreatedAt()).build();
    }
}

@Service @RequiredArgsConstructor
class AlertService {
    private final AlertRepository alertRepository;
    private final AuditService auditService;

    public Page<AlertDto> getAll(UUID tenantId, int page, int size) {
        return alertRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(page, size)).map(this::toDto);
    }
    public AlertDto getById(UUID id) {
        return toDto(alertRepository.findById(id).orElseThrow());
    }
    @Transactional
    public AlertDto update(UUID id, String status, UUID userId, String username, String ip) {
        var alert = alertRepository.findById(id).orElseThrow();
        alert.setStatus(status);
        if ("RESOLVED".equals(status)) alert.setResolvedAt(LocalDateTime.now());
        var saved = alertRepository.save(alert);
        auditService.log(username, userId, alert.getTenant().getId(), "UPDATE_ALERT", "ALERT", id, Map.of("status", status), ip);
        return toDto(saved);
    }
    private AlertDto toDto(Alert a) {
        return AlertDto.builder().id(a.getId()).title(a.getTitle()).severity(a.getSeverity())
            .status(a.getStatus()).description(a.getDescription()).source(a.getSource())
            .assignedTo(a.getAssignedTo() != null ? a.getAssignedTo().getId() : null)
            .assignedToName(a.getAssignedTo() != null ? a.getAssignedTo().getFullName() : null)
            .createdAt(a.getCreatedAt()).updatedAt(a.getUpdatedAt()).resolvedAt(a.getResolvedAt()).build();
    }
}

@Service @RequiredArgsConstructor
class CommentService {
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public List<CommentDto> getComments(String entityType, UUID entityId) {
        return commentRepository.findAllByEntityTypeAndEntityIdOrderByCreatedAtAsc(entityType, entityId)
            .stream().map(this::toDto).toList();
    }
    @Transactional
    public CommentDto addComment(String entityType, UUID entityId, String content, UUID authorId, UUID tenantId, String username, String ip) {
        var author = userRepository.findById(authorId).orElseThrow();
        var tenant = tenantRepository.findById(tenantId).orElseThrow();
        var comment = Comment.builder().entityType(entityType).entityId(entityId).tenant(tenant)
            .author(author).content(content).build();
        var saved = commentRepository.save(comment);
        auditService.log(username, authorId, tenantId, "ADD_COMMENT", entityType, entityId, null, ip);
        return toDto(saved);
    }
    private CommentDto toDto(Comment c) {
        return CommentDto.builder().id(c.getId()).entityType(c.getEntityType()).entityId(c.getEntityId())
            .authorId(c.getAuthor().getId()).authorName(c.getAuthor().getFullName())
            .authorUsername(c.getAuthor().getUsername()).content(c.getContent())
            .createdAt(c.getCreatedAt()).updatedAt(c.getUpdatedAt()).build();
    }
}

@Service @RequiredArgsConstructor
class DashboardService {
    private final EventRepository eventRepository;
    private final AlertRepository alertRepository;
    private final IncidentRepository incidentRepository;
    private final FalxdrEndpointRepository endpointRepository;

    public DashboardStatsDto getStats(UUID tenantId) {
        var endpoints = endpointRepository.findAllByTenantIdOrderByHostname(tenantId);
        return DashboardStatsDto.builder()
            .totalEvents(eventRepository.countByTenantId(tenantId))
            .totalAlerts(alertRepository.countByTenantId(tenantId))
            .openAlerts(alertRepository.countByTenantIdAndStatus(tenantId, "OPEN"))
            .openIncidents(incidentRepository.countByTenantIdAndStatusAndArchived(tenantId, "OPEN", false))
            .criticalIncidents(incidentRepository.countByTenantIdAndStatusAndArchived(tenantId, "CRITICAL", false))
            .totalEndpoints(endpoints.size())
            .activeEndpoints(endpoints.stream().filter(e -> "ACTIVE".equals(e.getAgentStatus())).count())
            .build();
    }
}