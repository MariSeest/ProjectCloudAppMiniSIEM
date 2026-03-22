package it.lilsec.siem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import it.lilsec.siem.entity.AcnReport;
import it.lilsec.siem.repository.AcnReportRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/acn")
public class AcnController {

    private final AcnReportRepository acnRepo;
    private final ObjectMapper mapper = new ObjectMapper();

    public AcnController(AcnReportRepository acnRepo) {
        this.acnRepo = acnRepo;
    }

    @GetMapping
    public List<AcnReport> list() {
        return acnRepo.findAllByTenantIdOrderByCreatedAtDesc(getTenantId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcnReport> get(@PathVariable UUID id) {
        return acnRepo.findById(id).map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public AcnReport create(@RequestBody Map<String,Object> body) throws Exception {
        AcnReport r = buildReport(new AcnReport(), body);
        r.setTenantId(getTenantId());
        r.setStatus("DRAFT");
        r.setCreatedBy(getUsername());
        return acnRepo.save(r);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcnReport> update(@PathVariable UUID id,
                                             @RequestBody Map<String,Object> body) throws Exception {
        AcnReport r = acnRepo.findById(id).orElseThrow();
        buildReport(r, body);
        return ResponseEntity.ok(acnRepo.save(r));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<AcnReport> submit(@PathVariable UUID id) {
        AcnReport r = acnRepo.findById(id).orElseThrow();
        r.setStatus("SUBMITTED");
        r.setSubmittedAt(LocalDateTime.now());
        return ResponseEntity.ok(acnRepo.save(r));
    }

    private AcnReport buildReport(AcnReport r, Map<String,Object> body) throws Exception {
        if (body.containsKey("notificationType"))
            r.setNotificationType((String) body.get("notificationType"));
        r.setSectionA(toJson(body.get("sectionA")));
        r.setSectionB(toJson(body.get("sectionB")));
        r.setSectionC(toJson(body.get("sectionC")));
        r.setSectionD(toJson(body.get("sectionD")));
        r.setSectionE(toJson(body.get("sectionE")));
        r.setSectionF(toJson(body.get("sectionF")));
        r.setSectionG(toJson(body.get("sectionG")));
        r.setSectionH(toJson(body.get("sectionH")));
        r.setSectionI(toJson(body.get("sectionI")));
        r.setSectionL(toJson(body.get("sectionL")));
        return r;
    }

    private String toJson(Object obj) throws Exception {
        return obj == null ? null : mapper.writeValueAsString(obj);
    }

    private String getTenantId() {
        return "00000000-0000-0000-0000-000000000002";
    }

    private String getUsername() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a != null ? a.getName() : "system";
    }
}