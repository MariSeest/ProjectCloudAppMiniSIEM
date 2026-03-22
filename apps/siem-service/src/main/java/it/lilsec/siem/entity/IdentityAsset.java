package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "identity_assets")
public class IdentityAsset {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(nullable = false) private String tenantId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id") private FalxdrEndpoint endpoint;
    @Column(nullable = false) private String username;
    private String fullName, passwordStrength;
    private LocalDateTime lastPasswordChange;
    @Column(nullable = false) private Boolean forceResetRequested = false;
    private LocalDateTime forceResetAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getTenantId() { return tenantId; }
    public void setTenantId(String tenantId) { this.tenantId = tenantId; }
    public FalxdrEndpoint getEndpoint() { return endpoint; }
    public void setEndpoint(FalxdrEndpoint endpoint) { this.endpoint = endpoint; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPasswordStrength() { return passwordStrength; }
    public void setPasswordStrength(String passwordStrength) { this.passwordStrength = passwordStrength; }
    public LocalDateTime getLastPasswordChange() { return lastPasswordChange; }
    public void setLastPasswordChange(LocalDateTime lastPasswordChange) { this.lastPasswordChange = lastPasswordChange; }
    public Boolean getForceResetRequested() { return forceResetRequested; }
    public void setForceResetRequested(Boolean forceResetRequested) { this.forceResetRequested = forceResetRequested; }
    public LocalDateTime getForceResetAt() { return forceResetAt; }
    public void setForceResetAt(LocalDateTime forceResetAt) { this.forceResetAt = forceResetAt; }
}