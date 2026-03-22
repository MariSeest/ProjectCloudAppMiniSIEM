package it.lilsec.siem.controller;

import it.lilsec.siem.entity.SiemUser;
import it.lilsec.siem.repository.SiemUserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final SiemUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserController(SiemUserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<SiemUser> list() { return userRepo.findAll(); }

    @PostMapping
    public SiemUser create(@RequestBody Map<String,Object> body) {
        SiemUser u = new SiemUser();
        u.setUsername((String) body.get("username"));
        u.setEmail((String) body.getOrDefault("email", body.get("username") + "@minisiem.local"));
        u.setPasswordHash(passwordEncoder.encode((String) body.getOrDefault("password", "changeme")));
        u.setFullName((String) body.getOrDefault("fullName", body.get("username")));
        u.setRole((String) body.getOrDefault("role", "READ_ONLY"));
        u.setTenantId((String) body.getOrDefault("tenantId", "00000000-0000-0000-0000-000000000002"));
        u.setTenantName((String) body.getOrDefault("tenantName", "Satremar"));
        u.setIsActive(true);
        u.setCreatedAt(LocalDateTime.now());
        return userRepo.save(u);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SiemUser> update(@PathVariable UUID id,
                                            @RequestBody Map<String,Object> body) {
        SiemUser u = userRepo.findById(id).orElseThrow();
        if (body.containsKey("fullName")) u.setFullName((String) body.get("fullName"));
        if (body.containsKey("role")) u.setRole((String) body.get("role"));
        if (body.containsKey("isActive")) u.setIsActive((Boolean) body.get("isActive"));
        if (body.containsKey("password") && body.get("password") != null)
            u.setPasswordHash(passwordEncoder.encode((String) body.get("password")));
        return ResponseEntity.ok(userRepo.save(u));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

@GetMapping("/tenants")
public List<Map<String,String>> tenants() {
    return List.of(
        Map.of("id","00000000-0000-0000-0000-000000000001","name","Admin Tenant","slug","admin"),
        Map.of("id","00000000-0000-0000-0000-000000000002","name","aziendacliente","slug","aziendacliente")
    );
}
}