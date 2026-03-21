package com.minisiem.service;

import com.minisiem.dto.*;
import com.minisiem.entity.*;
import com.minisiem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class IncidentService {
    private final IncidentRepository incidentRepository;
    private final IncidentCorrelationRepository correlationRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<IncidentDto> getActive(UUID tenantId) {
        var incidents = incidentRepository.findActiveByTenantId(tenantId);
        var allCorrelations = correlationRepository.findAllByTenantId(tenantId);
        return incidents.stream().map(i -> toDto(i, allCorrelations)).toList();
    }

    public List<IncidentDto> getArchived(UUID tenantId) {
        return incidentRepository.findArchivedByTenantId(tenantId).stream().map(i -> toDto(i, List.of())).toList();
    }

    public IncidentDto getById(UUID id, UUID tenantId) {
        var incident = incidentRepository.findById(id).orElseThrow();
        var correlations = correlationRepository.findByIncidentId(tenantId, id);
        return toDto(incident, correlations);
    }

    @Transactional
    public IncidentDto create(CreateIncidentRequest req, UUID tenantId, UUID userId, String username, String ip) {
        var tenant = tenantRepository.findById(tenantId).orElseThrow();
        var incident = Incident.builder().tenant(tenant).title(req.getTitle()).severity(req.getSeverity())
            .status("OPEN").description(req.getDescription()).cveIds(req.getCveIds()).archived(false).build();
        var saved = incidentRepository.save(incident);
        auditService.log(username, userId, tenantId, "CREATE_INCIDENT", "INCIDENT", saved.getId(),
            Map.of("title", saved.getTitle()), ip);
        return toDto(saved, List.of());
    }

    @Transactional
    public IncidentDto update(UUID id, UpdateIncidentRequest req, UUID userId, String username, String ip) {
        var incident = incidentRepository.findById(id).orElseThrow();
        if (req.getTitle() != null) incident.setTitle(req.getTitle());
        if (req.getSeverity() != null) incident.setSeverity(req.getSeverity());
        if (req.getStatus() != null) incident.setStatus(req.getStatus());
        if (req.getDescription() != null) incident.setDescription(req.getDescription());
        if (req.getCveIds() != null) incident.setCveIds(req.getCveIds());
        var saved = incidentRepository.save(incident);
        auditService.log(username, userId, incident.getTenant().getId(), "UPDATE_INCIDENT",
            "INCIDENT", id, Map.of("title", saved.getTitle()), ip);
        return toDto(saved, correlationRepository.findByIncidentId(incident.getTenant().getId(), id));
    }

    @Transactional
    public IncidentDto takeCharge(UUID id, TakeChargeRequest req, UUID userId, String username, String ip) {
        var incident = incidentRepository.findById(id).orElseThrow();
        var user = userRepository.findById(userId).orElseThrow();
        incident.setTakenChargeAt(LocalDateTime.now());
        incident.setTakenChargeBy(user);
        incident.setTakenChargeDurationMinutes(req.getDurationMinutes());
        var saved = incidentRepository.save(incident);
        auditService.log(username, userId, incident.getTenant().getId(), "TAKE_CHARGE_INCIDENT",
            "INCIDENT", id, Map.of("duration", req.getDurationMinutes() != null ? req.getDurationMinutes() : 0), ip);
        return toDto(saved, List.of());
    }

    @Transactional
    public IncidentDto archive(UUID id, UUID userId, String username, String ip) {
        var incident = incidentRepository.findById(id).orElseThrow();
        var user = userRepository.findById(userId).orElseThrow();
        incident.setArchived(true);
        incident.setArchivedAt(LocalDateTime.now());
        incident.setArchivedBy(user);
        var saved = incidentRepository.save(incident);
        auditService.log(username, userId, incident.getTenant().getId(), "ARCHIVE_INCIDENT",
            "INCIDENT", id, Map.of("title", incident.getTitle()), ip);
        return toDto(saved, List.of());
    }

    @Transactional
    public CorrelationDto correlate(CorrelationRequest req, UUID tenantId, UUID userId, String username, String ip) {
        var tenant = tenantRepository.findById(tenantId).orElseThrow();
        var i1 = incidentRepository.findById(req.getIncidentId1()).orElseThrow();
        var i2 = incidentRepository.findById(req.getIncidentId2()).orElseThrow();
        var user = userRepository.findById(userId).orElseThrow();
        var c = IncidentCorrelation.builder().tenant(tenant).incident1(i1).incident2(i2)
            .correlationType(req.getCorrelationType()).createdBy(user).build();
        var saved = correlationRepository.save(c);
        auditService.log(username, userId, tenantId, "CORRELATE_INCIDENTS",
            "INCIDENT_CORRELATION", saved.getId(), Map.of("type", req.getCorrelationType()), ip);
        return toCorrelationDto(saved);
    }

    @Transactional
    public void deleteCorrelation(UUID corrId, UUID userId, String username, String ip) {
        correlationRepository.deleteById(corrId);
        auditService.log(username, userId, null, "DELETE_CORRELATION", "INCIDENT_CORRELATION", corrId, null, ip);
    }

    @Transactional
    public void delete(UUID id, UUID userId, String username, String ip) {
        var incident = incidentRepository.findById(id).orElseThrow();
        correlationRepository.deleteByIncident1IdOrIncident2Id(id, id);
        incidentRepository.deleteById(id);
        auditService.log(username, userId, incident.getTenant().getId(), "DELETE_INCIDENT",
            "INCIDENT", id, Map.of("title", incident.getTitle()), ip);
    }

    private IncidentDto toDto(Incident i, List<IncidentCorrelation> allCorrelations) {
        var correlations = allCorrelations.stream()
            .filter(c -> c.getIncident1().getId().equals(i.getId()) || c.getIncident2().getId().equals(i.getId()))
            .map(this::toCorrelationDto).toList();
        return IncidentDto.builder().id(i.getId()).title(i.getTitle()).severity(i.getSeverity())
            .status(i.getStatus()).description(i.getDescription()).cveIds(i.getCveIds())
            .assignedTo(i.getAssignedTo() != null ? i.getAssignedTo().getId() : null)
            .assignedToName(i.getAssignedTo() != null ? i.getAssignedTo().getFullName() : null)
            .takenChargeAt(i.getTakenChargeAt())
            .takenChargeByName(i.getTakenChargeBy() != null ? i.getTakenChargeBy().getFullName() : null)
            .takenChargeDurationMinutes(i.getTakenChargeDurationMinutes())
            .archived(i.getArchived()).archivedAt(i.getArchivedAt())
            .createdAt(i.getCreatedAt()).updatedAt(i.getUpdatedAt()).correlations(correlations).build();
    }

    private CorrelationDto toCorrelationDto(IncidentCorrelation c) {
        return CorrelationDto.builder().id(c.getId())
            .incidentId1(c.getIncident1().getId()).incidentTitle1(c.getIncident1().getTitle())
            .incidentId2(c.getIncident2().getId()).incidentTitle2(c.getIncident2().getTitle())
            .correlationType(c.getCorrelationType())
            .createdByName(c.getCreatedBy() != null ? c.getCreatedBy().getFullName() : null)
            .createdAt(c.getCreatedAt()).build();
    }
}