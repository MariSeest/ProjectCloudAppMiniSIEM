package com.minisiem.service;

import com.minisiem.dto.AcnReportDto;
import com.minisiem.entity.*;
import com.minisiem.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class AcnReportService {
    private final AcnReportRepository acnReportRepository;
    private final TenantRepository tenantRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public List<AcnReportDto> getAll(UUID tenantId) {
        return acnReportRepository.findAllByTenantIdOrderByCreatedAtDesc(tenantId).stream().map(this::toDto).toList();
    }
    public AcnReportDto getById(UUID id) { return toDto(acnReportRepository.findById(id).orElseThrow()); }

    @Transactional
    public AcnReportDto create(AcnReportDto req, UUID tenantId, UUID userId, String username, String ip) {
        var tenant = tenantRepository.findById(tenantId).orElseThrow();
        var creator = userRepository.findById(userId).orElseThrow();
        var report = AcnReport.builder().tenant(tenant).status("DRAFT")
            .notificationType(req.getNotificationType())
            .sectionA(req.getSectionA()).sectionB(req.getSectionB()).sectionC(req.getSectionC())
            .sectionD(req.getSectionD()).sectionE(req.getSectionE()).sectionF(req.getSectionF())
            .sectionG(req.getSectionG()).sectionH(req.getSectionH()).sectionI(req.getSectionI())
            .sectionL(req.getSectionL()).createdBy(creator).build();
        if (req.getIncidentId() != null) incidentRepository.findById(req.getIncidentId()).ifPresent(report::setIncident);
        var saved = acnReportRepository.save(report);
        auditService.log(username, userId, tenantId, "CREATE_ACN_REPORT", "ACN_REPORT", saved.getId(), null, ip);
        return toDto(saved);
    }

    @Transactional
    public AcnReportDto update(UUID id, AcnReportDto req, UUID userId, String username, String ip) {
        var report = acnReportRepository.findById(id).orElseThrow();
        if (req.getNotificationType() != null) report.setNotificationType(req.getNotificationType());
        if (req.getSectionA() != null) report.setSectionA(req.getSectionA());
        if (req.getSectionB() != null) report.setSectionB(req.getSectionB());
        if (req.getSectionC() != null) report.setSectionC(req.getSectionC());
        if (req.getSectionD() != null) report.setSectionD(req.getSectionD());
        if (req.getSectionE() != null) report.setSectionE(req.getSectionE());
        if (req.getSectionF() != null) report.setSectionF(req.getSectionF());
        if (req.getSectionG() != null) report.setSectionG(req.getSectionG());
        if (req.getSectionH() != null) report.setSectionH(req.getSectionH());
        if (req.getSectionI() != null) report.setSectionI(req.getSectionI());
        if (req.getSectionL() != null) report.setSectionL(req.getSectionL());
        auditService.log(username, userId, report.getTenant().getId(), "UPDATE_ACN_REPORT", "ACN_REPORT", id, null, ip);
        return toDto(acnReportRepository.save(report));
    }

    @Transactional
    public AcnReportDto submit(UUID id, UUID userId, String username, String ip) {
        var report = acnReportRepository.findById(id).orElseThrow();
        report.setStatus("SUBMITTED");
        report.setSubmittedAt(LocalDateTime.now());
        auditService.log(username, userId, report.getTenant().getId(), "SUBMIT_ACN_REPORT", "ACN_REPORT", id, null, ip);
        return toDto(acnReportRepository.save(report));
    }

    private AcnReportDto toDto(AcnReport r) {
        return AcnReportDto.builder().id(r.getId())
            .incidentId(r.getIncident() != null ? r.getIncident().getId() : null)
            .notificationId(r.getNotificationId()).status(r.getStatus())
            .notificationType(r.getNotificationType())
            .sectionA(r.getSectionA()).sectionB(r.getSectionB()).sectionC(r.getSectionC())
            .sectionD(r.getSectionD()).sectionE(r.getSectionE()).sectionF(r.getSectionF())
            .sectionG(r.getSectionG()).sectionH(r.getSectionH()).sectionI(r.getSectionI())
            .sectionL(r.getSectionL()).createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
            .submittedAt(r.getSubmittedAt()).build();
    }
}