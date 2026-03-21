package com.minisiem.service;

import com.minisiem.dto.*;
import com.minisiem.entity.*;
import com.minisiem.repository.*;
import com.minisiem.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse login(LoginRequest req, String ip) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        var user = userRepository.findByUsername(req.getUsername()).orElseThrow();
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        var ud = userDetailsService.loadUserByUsername(user.getUsername());
        UUID tenantId = user.getTenant() != null ? user.getTenant().getId() : null;
        String token = jwtUtil.generateToken(ud, user.getId(), tenantId, user.getRole());
        auditService.log(user.getUsername(), user.getId(), tenantId, "LOGIN", "USER", user.getId(), null, ip);
        return AuthResponse.builder().token(token).userId(user.getId()).username(user.getUsername())
            .fullName(user.getFullName()).role(user.getRole()).tenantId(tenantId)
            .tenantName(user.getTenant() != null ? user.getTenant().getName() : null).build();
    }

    public UserDto getUserByUsername(String username) {
        return toDto(userRepository.findByUsername(username).orElseThrow());
    }

    @Transactional
    public UserDto createUser(CreateUserRequest req, UUID creatorId, UUID creatorTenantId) {
        if (userRepository.findByUsername(req.getUsername()).isPresent())
            throw new RuntimeException("Username already exists");
        var user = User.builder().username(req.getUsername()).email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword())).fullName(req.getFullName())
            .role(req.getRole()).isActive(true).build();
        if (req.getTenantId() != null) tenantRepository.findById(req.getTenantId()).ifPresent(user::setTenant);
        var saved = userRepository.save(user);
        auditService.log(null, creatorId, creatorTenantId, "CREATE_USER", "USER", saved.getId(), null, null);
        return toDto(saved);
    }

    public List<UserDto> getAllUsers() { return userRepository.findAll().stream().map(this::toDto).toList(); }
    public List<UserDto> getUsersByTenant(UUID tenantId) { return userRepository.findAllByTenantId(tenantId).stream().map(this::toDto).toList(); }

    @Transactional
    public UserDto updateUser(UUID userId, UpdateUserRequest req, UUID updaterId) {
        var user = userRepository.findById(userId).orElseThrow();
        if (req.getFullName() != null) user.setFullName(req.getFullName());
        if (req.getRole() != null) user.setRole(req.getRole());
        if (req.getIsActive() != null) user.setIsActive(req.getIsActive());
        if (req.getPassword() != null && !req.getPassword().isBlank())
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        if (req.getTenantId() != null) tenantRepository.findById(req.getTenantId()).ifPresent(user::setTenant);
        auditService.log(null, updaterId, null, "UPDATE_USER", "USER", userId, null, null);
        return toDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId, UUID deleterId) {
        userRepository.deleteById(userId);
        auditService.log(null, deleterId, null, "DELETE_USER", "USER", userId, null, null);
    }

    public List<TenantDto> getAllTenants() {
        return tenantRepository.findAll().stream().map(t -> new TenantDto(t.getId(), t.getName(), t.getSlug())).toList();
    }

    private UserDto toDto(User u) {
        return UserDto.builder().id(u.getId()).username(u.getUsername()).email(u.getEmail())
            .fullName(u.getFullName()).role(u.getRole()).isActive(u.getIsActive())
            .tenantId(u.getTenant() != null ? u.getTenant().getId() : null)
            .tenantName(u.getTenant() != null ? u.getTenant().getName() : null)
            .lastLogin(u.getLastLogin()).createdAt(u.getCreatedAt()).build();
    }
}