package it.lilsec.siem.controller;

import it.lilsec.siem.entity.IdentityAsset;
import it.lilsec.siem.repository.IdentityAssetRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/identity")
public class IdentityController {

    private final IdentityAssetRepository identityRepo;

    public IdentityController(IdentityAssetRepository identityRepo) {
        this.identityRepo = identityRepo;
    }

    @GetMapping
    @Transactional
    public List<Map<String,Object>> list() {
        return identityRepo.findAllByTenantIdOrderByPasswordStrengthAsc(
                "00000000-0000-0000-0000-000000000002")
            .stream()
            .map(a -> {
                Map<String,Object> m = new LinkedHashMap<>();
                m.put("id", a.getId());
                m.put("username", a.getUsername());
                m.put("fullName", a.getFullName());
                m.put("passwordStrength", a.getPasswordStrength());
                m.put("lastPasswordChange", a.getLastPasswordChange());
                m.put("forceResetRequested", a.getForceResetRequested());
                m.put("forceResetAt", a.getForceResetAt());
                m.put("tenantId", a.getTenantId());
                m.put("endpointId", a.getEndpoint() != null ? a.getEndpoint().getId() : null);
                m.put("endpointHostname", a.getEndpoint() != null ? a.getEndpoint().getHostname() : null);
                return m;
            }).toList();
    }

    @PostMapping("/{id}/force-reset")
    @Transactional
    public ResponseEntity<Map<String,Object>> forceReset(@PathVariable UUID id) {
        IdentityAsset asset = identityRepo.findById(id).orElseThrow();
        asset.setForceResetRequested(true);
        asset.setForceResetAt(LocalDateTime.now());
        identityRepo.save(asset);
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", asset.getId());
        m.put("username", asset.getUsername());
        m.put("forceResetRequested", asset.getForceResetRequested());
        m.put("forceResetAt", asset.getForceResetAt());
        return ResponseEntity.ok(m);
    }
}