package it.lilsec.siem.controller;

import it.lilsec.siem.entity.Alert;
import it.lilsec.siem.repository.AlertRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private static final String TENANT = "00000000-0000-0000-0000-000000000002";
    private final AlertRepository repo;

    public AlertController(AlertRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Page<Alert> p = repo.findAllByTenantIdOrderByCreatedAtDesc(TENANT, PageRequest.of(page, size));
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", p.getContent());
        resp.put("totalElements", p.getTotalElements());
        resp.put("totalPages", p.getTotalPages());
        resp.put("number", p.getNumber());
        resp.put("size", p.getSize());
        return resp;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Alert> get(@PathVariable UUID id) {
        return repo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Alert> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return repo.findById(id).map(a -> {
            a.setStatus(body.getOrDefault("status", a.getStatus()));
            return ResponseEntity.ok(repo.save(a));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/comments")
    public List<Object> getComments(@PathVariable UUID id) { return List.of(); }

    @PostMapping("/{id}/comments")
    public Map<String, Object> addComment(@PathVariable UUID id,
                                           @RequestBody Map<String, String> body) {
        return Map.of(
            "id", UUID.randomUUID().toString(),
            "content", body.getOrDefault("content", ""),
            "createdAt", java.time.LocalDateTime.now().toString()
        );
    }
}