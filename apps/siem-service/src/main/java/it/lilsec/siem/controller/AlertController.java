package it.lilsec.siem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private static final List<Map<String,Object>> MOCK_ALERTS = new ArrayList<>();

    static {
        String[][] data = {
            {"Brute Force Attack Detected", "CRITICAL", "OPEN", "FALXDR Agent", "Multiple failed login attempts on SRV-DC01 from 192.168.1.105. 47 attempts in 5 minutes."},
            {"Suspicious PowerShell Execution", "HIGH", "OPEN", "FALXDR Agent", "Encoded PowerShell command executed on WKSTN-001 by user john.doe. Possible obfuscation detected."},
            {"Lateral Movement Detected", "HIGH", "ACK", "Correlation Engine", "Abnormal SMB connections between WKSTN-001 and SRV-DC01 detected outside business hours."},
            {"Malware Signature Detected", "CRITICAL", "OPEN", "FALXDR Agent", "Known ransomware signature detected in C:\\Users\\Temp\\update.exe on WKSTN-042."},
            {"Data Exfiltration Attempt", "HIGH", "RESOLVED", "Network Monitor", "Large data transfer (2.3 GB) to external IP 185.220.101.45 from SRV-DC01."},
            {"Privilege Escalation Attempt", "MEDIUM", "ACK", "FALXDR Agent", "User luisa.mele attempted to access admin shares on SRV-DC01 without proper authorization."},
            {"Anomalous Login Time", "MEDIUM", "RESOLVED", "Alert Engine", "User admin logged in at 03:47 AM from IP 10.0.0.55 — outside normal working hours."},
            {"CVE-2024-39174 Exploitation Attempt", "HIGH", "OPEN", "Threat Intel Feed", "Exploitation attempt for CVE-2024-39174 detected against vulnerability-service:8081."},
            {"DNS Tunneling Detected", "MEDIUM", "ACK", "Network Monitor", "Unusual DNS query patterns detected from WKSTN-042, possible C2 communication."},
            {"Unauthorized USB Device", "LOW", "RESOLVED", "FALXDR Agent", "Unknown USB storage device connected to WKSTN-001 by user john.doe at 14:32."},
        };

        LocalDateTime base = LocalDateTime.now().minusDays(3);
        for (int i = 0; i < data.length; i++) {
            Map<String,Object> a = new LinkedHashMap<>();
            a.put("id", UUID.randomUUID().toString());
            a.put("title", data[i][0]);
            a.put("severity", data[i][1]);
            a.put("status", data[i][2]);
            a.put("source", data[i][3]);
            a.put("description", data[i][4]);
            a.put("createdAt", base.plusHours(i * 7).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            a.put("updatedAt", base.plusHours(i * 7 + 1).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            a.put("tenantId", "00000000-0000-0000-0000-000000000002");
            a.put("comments", List.of());
            MOCK_ALERTS.add(a);
        }
    }

    @GetMapping
    public Map<String,Object> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        Map<String,Object> resp = new LinkedHashMap<>();
        resp.put("content", MOCK_ALERTS);
        resp.put("totalElements", MOCK_ALERTS.size());
        resp.put("totalPages", 1);
        resp.put("number", page);
        resp.put("size", size);
        return resp;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String,Object>> get(@PathVariable String id) {
        return MOCK_ALERTS.stream()
            .filter(a -> id.equals(a.get("id")))
            .findFirst()
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String,Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String,String> body) {
        for (Map<String,Object> a : MOCK_ALERTS) {
            if (id.equals(a.get("id"))) {
                a.put("status", body.getOrDefault("status", "OPEN"));
                return ResponseEntity.ok(a);
            }
        }
        return ResponseEntity.notFound().build();
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