package it.lilsec.siem.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @GetMapping
    public Map<String,Object> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Map<String,Object> resp = new LinkedHashMap<>();
        resp.put("content", List.of());
        resp.put("totalElements", 0);
        resp.put("totalPages", 0);
        resp.put("number", page);
        resp.put("size", size);
        return resp;
    }

    @GetMapping("/{id}")
    public Map<String,Object> get(@PathVariable String id) {
        return Map.of(
            "id", id,
            "title", "Event",
            "source", "system",
            "severity", "LOW",
            "timestamp", LocalDateTime.now().toString()
        );
    }

    @GetMapping("/{id}/comments")
    public List<Object> getComments(@PathVariable String id) {
        return List.of();
    }

    @PostMapping("/{id}/comments")
    public Map<String,Object> addComment(@PathVariable String id,
                                          @RequestBody Map<String,String> body) {
        return Map.of(
            "id", UUID.randomUUID().toString(),
            "content", body.getOrDefault("content", ""),
            "createdAt", LocalDateTime.now().toString()
        );
    }
}