package it.lilsec.siem.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String API_KEY = System.getenv("ANTHROPIC_API_KEY") != null
        ? System.getenv("ANTHROPIC_API_KEY") : "";

    @PostMapping("/analyze")
    public ResponseEntity<String> analyze(@RequestBody Map<String,Object> body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", API_KEY);
        headers.set("anthropic-version", "2023-06-01");

        HttpEntity<Map<String,Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                ANTHROPIC_URL, HttpMethod.POST, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }
}