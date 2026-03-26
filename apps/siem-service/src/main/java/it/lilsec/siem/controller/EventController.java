package it.lilsec.siem.controller;

import it.lilsec.siem.entity.SiemEvent;
import it.lilsec.siem.repository.SiemEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final String TENANT = "00000000-0000-0000-0000-000000000002";
    private final SiemEventRepository repo;

    public EventController(SiemEventRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public Map<String, Object> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Page<SiemEvent> p = repo.findAllByTenantIdOrderByTimestampDesc(TENANT, PageRequest.of(page, size));
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("content", p.getContent());
        resp.put("totalElements", p.getTotalElements());
        resp.put("totalPages", p.getTotalPages());
        resp.put("number", p.getNumber());
        resp.put("size", p.getSize());
        return resp;
    }

    @GetMapping("/{id}")
    public Map<String, Object> get(@PathVariable UUID id) {
        SiemEvent e = repo.findById(id).orElse(null);
        if (e == null) return Map.of("id", id.toString(), "title", "Event not found");
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", e.getId());
        m.put("title", e.getTitle());
        m.put("category", e.getCategory());
        m.put("severity", e.getSeverity());
        m.put("source", e.getSource());
        m.put("sourceIp", e.getSourceIp());
        m.put("description", e.getDescription());
        m.put("timestamp", e.getTimestamp());
        m.put("createdAt", e.getCreatedAt());
        return m;
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