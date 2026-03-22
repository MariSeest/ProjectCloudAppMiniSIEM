package it.lilsec.siem.controller;

import it.lilsec.siem.entity.*;
import it.lilsec.siem.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/falxdr")
public class FalxdrController {

    private final FalxdrEndpointRepository endpointRepo;
    private final FalxdrApplicationRepository appRepo;
    private final FalxdrLoginHistoryRepository loginRepo;
    private final FalxdrCommandRepository commandRepo;
    private final FalxdrBrowserHistoryRepository browserRepo;

    public FalxdrController(FalxdrEndpointRepository endpointRepo,
                             FalxdrApplicationRepository appRepo,
                             FalxdrLoginHistoryRepository loginRepo,
                             FalxdrCommandRepository commandRepo,
                             FalxdrBrowserHistoryRepository browserRepo) {
        this.endpointRepo = endpointRepo;
        this.appRepo = appRepo;
        this.loginRepo = loginRepo;
        this.commandRepo = commandRepo;
        this.browserRepo = browserRepo;
    }

    @GetMapping("/endpoints")
    public List<FalxdrEndpoint> endpoints() {
        return endpointRepo.findAllByTenantIdOrderByHostname(
            "00000000-0000-0000-0000-000000000002");
    }

    @GetMapping("/endpoints/{id}")
    @Transactional
    public ResponseEntity<Map<String,Object>> detail(@PathVariable UUID id) {
        FalxdrEndpoint ep = endpointRepo.findById(id).orElseThrow();
        Map<String,Object> result = new LinkedHashMap<>();
        result.put("endpoint", ep);
        result.put("applications", appRepo.findAllByEndpointIdAndIsInstalledTrue(id));
        result.put("loginHistory", loginRepo.findAllByEndpointIdOrderByLoginTimeDesc(id));
        result.put("commands", commandRepo.findAllByEndpointIdOrderByExecutedAtDesc(id));
        result.put("browserHistory", browserRepo.findTop20ByEndpointIdOrderByVisitedAtDesc(id));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/endpoints/{id}/install-app")
    @Transactional
    public ResponseEntity<Map<String,Object>> installApp(@PathVariable UUID id,
                                                          @RequestBody Map<String,String> body) {
        FalxdrEndpoint ep = endpointRepo.findById(id).orElseThrow();
        FalxdrApplication app = new FalxdrApplication();
        app.setEndpoint(ep);
        app.setName(body.get("appName"));
        app.setVersion("1.0.0");
        app.setPublisher("Manual Install");
        app.setInstallDate(LocalDate.now());
        app.setIsInstalled(true);
        FalxdrApplication saved = appRepo.save(app);
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id", saved.getId());
        m.put("name", saved.getName());
        m.put("version", saved.getVersion());
        m.put("isInstalled", saved.getIsInstalled());
        return ResponseEntity.ok(m);
    }

    @DeleteMapping("/endpoints/{eid}/apps/{aid}")
    @Transactional
    public ResponseEntity<Void> removeApp(@PathVariable UUID eid, @PathVariable UUID aid) {
        appRepo.findById(aid).ifPresent(app -> {
            app.setIsInstalled(false);
            appRepo.save(app);
        });
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/endpoints/{id}/install-agent")
    @Transactional
    public ResponseEntity<FalxdrEndpoint> installAgent(@PathVariable UUID id) {
        FalxdrEndpoint ep = endpointRepo.findById(id).orElseThrow();
        ep.setAgentStatus("ACTIVE");
        ep.setAgentVersion("1.2.3");
        ep.setLastSeen(LocalDateTime.now());
        return ResponseEntity.ok(endpointRepo.save(ep));
    }

    @GetMapping("/discover")
    public List<Map<String,Object>> discover() {
        List<Map<String,Object>> assets = new ArrayList<>();
        String[][] discovered = {
            {"WKSTN-101","192.168.2.101","Windows 11 Pro"},
            {"WKSTN-102","192.168.2.102","Windows 10 Pro"},
            {"SRV-APP01","192.168.2.10","Windows Server 2022"},
            {"LAPTOP-005","192.168.2.55","Windows 11 Pro"},
            {"WKSTN-099","192.168.2.99","Windows 10 Pro"}
        };
        for (String[] d : discovered) {
            Map<String,Object> a = new LinkedHashMap<>();
            a.put("hostname", d[0]);
            a.put("ipAddress", d[1]);
            a.put("os", d[2]);
            a.put("agentInstalled", false);
            assets.add(a);
        }
        return assets;
    }
}