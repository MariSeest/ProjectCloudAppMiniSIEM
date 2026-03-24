package it.lilsec.siem.controller;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private static final List<Map<String,Object>> MOCK_EVENTS = new ArrayList<>();

    static {
        String[][] data = {
            {"Failed Login Attempt", "AUTH", "HIGH", "WKSTN-001", "192.168.1.105", "User admin failed login attempt #47"},
            {"PowerShell Script Executed", "PROCESS", "HIGH", "WKSTN-001", "192.168.1.101", "powershell.exe -EncodedCommand JABX..."},
            {"SMB Connection Established", "NETWORK", "MEDIUM", "WKSTN-001", "192.168.1.101", "Outbound SMB connection to SRV-DC01:445"},
            {"File Created in Temp Directory", "FILE", "MEDIUM", "WKSTN-042", "192.168.1.142", "C:\\Users\\Temp\\update.exe created by SYSTEM"},
            {"Large Outbound Transfer", "NETWORK", "HIGH", "SRV-DC01", "192.168.1.10", "2.3 GB transfer to 185.220.101.45:443"},
            {"Admin Share Access Attempt", "AUTH", "MEDIUM", "SRV-DC01", "192.168.1.10", "Unauthorized access attempt to ADMIN$ by luisa.mele"},
            {"Off-Hours Login", "AUTH", "LOW", "WKSTN-001", "192.168.1.101", "User admin authenticated at 03:47 from 10.0.0.55"},
            {"HTTP Request to Known Malicious URL", "NETWORK", "HIGH", "WKSTN-042", "192.168.1.142", "GET http://185.220.101.45/payload.bin"},
            {"DNS Query Anomaly", "NETWORK", "MEDIUM", "WKSTN-042", "192.168.1.142", "Unusual DNS TXT query: abc123.malware.c2.net"},
            {"USB Device Connected", "DEVICE", "LOW", "WKSTN-001", "192.168.1.101", "USB Mass Storage Device VID:0951 PID:1666 connected"},
            {"Registry Key Modified", "REGISTRY", "MEDIUM", "SRV-DC01", "192.168.1.10", "HKLM\\SOFTWARE\\Microsoft\\Windows\\Run modified"},
            {"Service Installed", "PROCESS", "HIGH", "SRV-DC01", "192.168.1.10", "New service svchost32 installed by SYSTEM"},
        };

        LocalDateTime base = LocalDateTime.now().minusDays(5);
        for (int i = 0; i < data.length; i++) {
            Map<String,Object> e = new LinkedHashMap<>();
            e.put("id", UUID.randomUUID().toString());
            e.put("title", data[i][0]);
            e.put("category", data[i][1]);
            e.put("severity", data[i][2]);
            e.put("source", data[i][3]);
            e.put("sourceIp", data[i][4]);
            e.put("description", data[i][5]);
            e.put("timestamp", base.plusHours(i * 10).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            e.put("tenantId", "00000000-0000-0000-0000-000000000002");
            e.put("comments", List.of());
            MOCK_EVENTS.add(e);
        }
    }

    @GetMapping
    public Map<String,Object> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        Map<String,Object> resp = new LinkedHashMap<>();
        resp.put("content", MOCK_EVENTS);
        resp.put("totalElements", MOCK_EVENTS.size());
        resp.put("totalPages", 1);
        resp.put("number", page);
        resp.put("size", size);
        return resp;
    }

    @GetMapping("/{id}")
    public Map<String,Object> get(@PathVariable String id) {
        return MOCK_EVENTS.stream()
            .filter(e -> id.equals(e.get("id")))
            .findFirst()
            .orElse(Map.of("id", id, "title", "Event not found"));
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