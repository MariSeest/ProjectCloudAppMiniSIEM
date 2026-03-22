package it.lilsec.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Map<String, UserRecord> USERS = Map.of(
        "admin", new UserRecord(
            UUID.fromString("11111111-1111-1111-1111-111111111111"),
            "admin",
            "Administrator",
            "admin@example.com",
            "ADMIN",
            null,
            null,
            "admin123"
        ),
        "luisa.mele", new UserRecord(
            UUID.fromString("22222222-2222-2222-2222-222222222222"),
            "luisa.mele",
            "Luisa Mele",
            "luisa.mele@example.com",
            "ADMIN",
            null,
            null,
            "admin123"
        )
    );

    private static final Map<String, UserSession> TOKENS = new ConcurrentHashMap<>();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if (request == null || request.username() == null || request.password() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Username and password are required"));
        }

        UserRecord user = USERS.get(request.username());
        if (user == null || !user.password().equals(request.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid credentials"));
        }

        String token = UUID.randomUUID().toString();
        TOKENS.put(token, new UserSession(
            user.id(),
            user.username(),
            user.fullName(),
            user.email(),
            user.role(),
            user.tenantId(),
            user.tenantName()
        ));

        return ResponseEntity.ok(Map.of(
            "token", token,
            "userId", user.id().toString(),
            "username", user.username(),
            "fullName", user.fullName(),
            "email", user.email(),
            "role", user.role(),
            "tenantId", user.tenantId(),
            "tenantName", user.tenantName()
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Missing or invalid Authorization header"));
        }

        String token = authorization.substring("Bearer ".length()).trim();
        UserSession session = TOKENS.get(token);

        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid or expired token"));
        }

        return ResponseEntity.ok(Map.of(
            "id", session.id().toString(),
            "username", session.username(),
            "fullName", session.fullName(),
            "email", session.email(),
            "role", session.role(),
            "tenantId", session.tenantId(),
            "tenantName", session.tenantName()
        ));
    }

    public record LoginRequest(String username, String password) {}

    private record UserRecord(
        UUID id,
        String username,
        String fullName,
        String email,
        String role,
        String tenantId,
        String tenantName,
        String password
    ) {}

    private record UserSession(
        UUID id,
        String username,
        String fullName,
        String email,
        String role,
        String tenantId,
        String tenantName
    ) {}
}