package com.minisiem.controller;

import com.minisiem.dto.*;
import com.minisiem.entity.AuditLog;
import com.minisiem.security.JwtUtil;
import com.minisiem.service.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest req, HttpServletRequest http) {
        return ResponseEntity.ok(authService.login(req, http.getRemoteAddr()));
    }
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(authService.getUserByUsername(jwtUtil.extractUsername(bearer.substring(7))));
    }
}

@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
class UserController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAll(@RequestHeader("Authorization") String bearer) {
        String role = jwtUtil.extractRole(bearer.substring(7));
        if ("ADMIN".equals(role)) return ResponseEntity.ok(authService.getAllUsers());
        return ResponseEntity.ok(authService.getUsersByTenant(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @PostMapping @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> create(@RequestBody CreateUserRequest req, @RequestHeader("Authorization") String bearer) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(authService.createUser(req, jwtUtil.extractUserId(t), jwtUtil.extractTenantId(t)));
    }
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> update(@PathVariable UUID id, @RequestBody UpdateUserRequest req, @RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(authService.updateUser(id, req, jwtUtil.extractUserId(bearer.substring(7))));
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestHeader("Authorization") String bearer) {
        authService.deleteUser(id, jwtUtil.extractUserId(bearer.substring(7)));
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/tenants") @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TenantDto>> getTenants() { return ResponseEntity.ok(authService.getAllTenants()); }
}

@RestController @RequestMapping("/api/incidents") @RequiredArgsConstructor
class IncidentController {
    private final IncidentService incidentService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<IncidentDto>> getActive(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(incidentService.getActive(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @GetMapping("/archived")
    public ResponseEntity<List<IncidentDto>> getArchived(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(incidentService.getArchived(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<IncidentDto> getById(@PathVariable UUID id, @RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(incidentService.getById(id, jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @PostMapping @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<IncidentDto> create(@RequestBody CreateIncidentRequest req,
                                               @RequestHeader("Authorization") String bearer,
                                               Authentication auth, HttpServletRequest http) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(incidentService.create(req, jwtUtil.extractTenantId(t), jwtUtil.extractUserId(t), auth.getName(), http.getRemoteAddr()));
    }
    @PatchMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<IncidentDto> update(@PathVariable UUID id, @RequestBody UpdateIncidentRequest req,
                                               @RequestHeader("Authorization") String bearer,
                                               Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(incidentService.update(id, req, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
    @PostMapping("/{id}/take-charge") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<IncidentDto> takeCharge(@PathVariable UUID id, @RequestBody TakeChargeRequest req,
                                                   @RequestHeader("Authorization") String bearer,
                                                   Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(incidentService.takeCharge(id, req, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
    @PostMapping("/{id}/archive") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<IncidentDto> archive(@PathVariable UUID id, @RequestHeader("Authorization") String bearer,
                                                Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(incidentService.archive(id, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
    @DeleteMapping("/{id}") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Void> delete(@PathVariable UUID id, @RequestHeader("Authorization") String bearer,
                                        Authentication auth, HttpServletRequest http) {
        incidentService.delete(id, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/correlate") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<CorrelationDto> correlate(@RequestBody CorrelationRequest req,
                                                     @RequestHeader("Authorization") String bearer,
                                                     Authentication auth, HttpServletRequest http) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(incidentService.correlate(req, jwtUtil.extractTenantId(t), jwtUtil.extractUserId(t), auth.getName(), http.getRemoteAddr()));
    }
    @DeleteMapping("/correlations/{corrId}") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Void> deleteCorrelation(@PathVariable UUID corrId, @RequestHeader("Authorization") String bearer,
                                                   Authentication auth, HttpServletRequest http) {
        incidentService.deleteCorrelation(corrId, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr());
        return ResponseEntity.noContent().build();
    }
}

@RestController @RequestMapping("/api/events") @RequiredArgsConstructor
class EventController {
    private final EventService eventService;
    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Page<EventDto>> getAll(@RequestHeader("Authorization") String bearer,
                                                  @RequestParam(defaultValue="0") int page,
                                                  @RequestParam(defaultValue="50") int size) {
        return ResponseEntity.ok(eventService.getAll(jwtUtil.extractTenantId(bearer.substring(7)), page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getById(@PathVariable UUID id) { return ResponseEntity.ok(eventService.getById(id)); }
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(commentService.getComments("EVENT", id));
    }
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable UUID id, @RequestBody CreateCommentRequest req,
                                                  @RequestHeader("Authorization") String bearer,
                                                  Authentication auth, HttpServletRequest http) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(commentService.addComment("EVENT", id, req.getContent(),
            jwtUtil.extractUserId(t), jwtUtil.extractTenantId(t), auth.getName(), http.getRemoteAddr()));
    }
}

@RestController @RequestMapping("/api/alerts") @RequiredArgsConstructor
class AlertController {
    private final AlertService alertService;
    private final CommentService commentService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<Page<AlertDto>> getAll(@RequestHeader("Authorization") String bearer,
                                                  @RequestParam(defaultValue="0") int page,
                                                  @RequestParam(defaultValue="50") int size) {
        return ResponseEntity.ok(alertService.getAll(jwtUtil.extractTenantId(bearer.substring(7)), page, size));
    }
    @GetMapping("/{id}")
    public ResponseEntity<AlertDto> getById(@PathVariable UUID id) { return ResponseEntity.ok(alertService.getById(id)); }
    @PatchMapping("/{id}/status") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<AlertDto> updateStatus(@PathVariable UUID id, @RequestBody Map<String,String> body,
                                                  @RequestHeader("Authorization") String bearer,
                                                  Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(alertService.update(id, body.get("status"),
            jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable UUID id) {
        return ResponseEntity.ok(commentService.getComments("ALERT", id));
    }
    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable UUID id, @RequestBody CreateCommentRequest req,
                                                  @RequestHeader("Authorization") String bearer,
                                                  Authentication auth, HttpServletRequest http) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(commentService.addComment("ALERT", id, req.getContent(),
            jwtUtil.extractUserId(t), jwtUtil.extractTenantId(t), auth.getName(), http.getRemoteAddr()));
    }
}

@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor
class DashboardController {
    private final DashboardService dashboardService;
    private final JwtUtil jwtUtil;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDto> stats(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(dashboardService.getStats(jwtUtil.extractTenantId(bearer.substring(7))));
    }
}

@RestController @RequestMapping("/api/audit") @RequiredArgsConstructor
class AuditController {
    private final AuditService auditService;
    private final JwtUtil jwtUtil;

    @GetMapping @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Page<AuditLog>> getLogs(@RequestHeader("Authorization") String bearer,
                                                   @RequestParam(defaultValue="0") int page,
                                                   @RequestParam(defaultValue="50") int size) {
        if ("ADMIN".equals(jwtUtil.extractRole(bearer.substring(7))))
            return ResponseEntity.ok(auditService.getAllLogs(PageRequest.of(page, size)));
        return ResponseEntity.ok(auditService.getLogsForTenant(jwtUtil.extractTenantId(bearer.substring(7)), PageRequest.of(page, size)));
    }
}

@RestController @RequestMapping("/api/acn") @RequiredArgsConstructor
class AcnController {
    private final AcnReportService acnReportService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<AcnReportDto>> getAll(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(acnReportService.getAll(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @GetMapping("/{id}")
    public ResponseEntity<AcnReportDto> getById(@PathVariable UUID id) { return ResponseEntity.ok(acnReportService.getById(id)); }
    @PostMapping
    public ResponseEntity<AcnReportDto> create(@RequestBody AcnReportDto req, @RequestHeader("Authorization") String bearer,
                                                Authentication auth, HttpServletRequest http) {
        String t = bearer.substring(7);
        return ResponseEntity.ok(acnReportService.create(req, jwtUtil.extractTenantId(t), jwtUtil.extractUserId(t), auth.getName(), http.getRemoteAddr()));
    }
    @PutMapping("/{id}")
    public ResponseEntity<AcnReportDto> update(@PathVariable UUID id, @RequestBody AcnReportDto req,
                                                @RequestHeader("Authorization") String bearer,
                                                Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(acnReportService.update(id, req, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
    @PostMapping("/{id}/submit")
    public ResponseEntity<AcnReportDto> submit(@PathVariable UUID id, @RequestHeader("Authorization") String bearer,
                                                Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(acnReportService.submit(id, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
}

@RestController @RequestMapping("/api/falxdr") @RequiredArgsConstructor
class FalxdrController {
    private final FalxdrService falxdrService;
    private final JwtUtil jwtUtil;

    @GetMapping("/endpoints")
    public ResponseEntity<List<EndpointDto>> getEndpoints(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(falxdrService.getEndpoints(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @GetMapping("/endpoints/{id}")
    public ResponseEntity<EndpointDetailDto> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(falxdrService.getEndpointDetail(id));
    }
    @PostMapping("/endpoints/{id}/install-app") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Map<String,String>> installApp(@PathVariable UUID id, @RequestBody Map<String,String> body) {
        falxdrService.installApp(id, body.get("appName"));
        return ResponseEntity.ok(Map.of("status","installing","app",body.get("appName")));
    }
    @DeleteMapping("/endpoints/{eid}/apps/{aid}") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Map<String,String>> removeApp(@PathVariable UUID eid, @PathVariable UUID aid) {
        falxdrService.removeApp(eid, aid);
        return ResponseEntity.ok(Map.of("status","removed"));
    }
    @GetMapping("/discover")
    public ResponseEntity<List<Map<String,String>>> discover(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(falxdrService.discoverAssets(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @PostMapping("/endpoints/{id}/install-agent") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<Map<String,String>> installAgent(@PathVariable UUID id) {
        return ResponseEntity.ok(Map.of("status","agent_installed","endpointId",id.toString()));
    }
}

@RestController @RequestMapping("/api/identity") @RequiredArgsConstructor
class IdentityController {
    private final IdentityService identityService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<IdentityAssetDto>> getAll(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(identityService.getAll(jwtUtil.extractTenantId(bearer.substring(7))));
    }
    @PostMapping("/{id}/force-reset") @PreAuthorize("hasAnyRole('ADMIN','ANALYST')")
    public ResponseEntity<IdentityAssetDto> forceReset(@PathVariable UUID id, @RequestHeader("Authorization") String bearer,
                                                        Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(identityService.forceReset(id, jwtUtil.extractUserId(bearer.substring(7)), auth.getName(), http.getRemoteAddr()));
    }
}