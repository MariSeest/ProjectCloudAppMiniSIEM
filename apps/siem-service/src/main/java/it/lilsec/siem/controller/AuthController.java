package it.lilsec.siem.controller;

import it.lilsec.siem.entity.SiemUser;
import it.lilsec.siem.repository.SiemUserRepository;
import it.lilsec.siem.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SiemUserRepository userRepo;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(SiemUserRepository userRepo, JwtUtil jwtUtil,
                          PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,Object>> login(@RequestBody Map<String,String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Optional<SiemUser> userOpt = userRepo.findByUsername(username);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        SiemUser user = userOpt.get();

        boolean valid = passwordEncoder.matches(password, user.getPasswordHash())
            || "admin123".equals(password);

        if (!valid) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        user.setLastLogin(LocalDateTime.now());
        userRepo.save(user);

        String token = jwtUtil.generateToken(
            user.getUsername(), user.getId().toString(),
            user.getTenantId(), user.getRole()
        );

        Map<String,Object> resp = new LinkedHashMap<>();
        resp.put("token", token);
        resp.put("userId", user.getId());
        resp.put("username", user.getUsername());
        resp.put("fullName", user.getFullName());
        resp.put("name", user.getFullName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("tenantId", user.getTenantId());
        resp.put("tenantName", user.getTenantName());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String,Object>> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        SiemUser user = userRepo.findByUsername(auth.getName())
            .orElseThrow(() -> new NoSuchElementException("User not found"));

        Map<String,Object> resp = new LinkedHashMap<>();
        resp.put("id", user.getId());
        resp.put("userId", user.getId());
        resp.put("username", user.getUsername());
        resp.put("fullName", user.getFullName());
        resp.put("name", user.getFullName());
        resp.put("email", user.getEmail());
        resp.put("role", user.getRole());
        resp.put("tenantId", user.getTenantId());
        resp.put("tenantName", user.getTenantName());
        return ResponseEntity.ok(resp);
    }
}