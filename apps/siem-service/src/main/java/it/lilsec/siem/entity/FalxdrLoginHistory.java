package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "falxdr_login_history")
public class FalxdrLoginHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false) private FalxdrEndpoint endpoint;
    @Column(nullable = false) private String username;
    @Column(nullable = false) private LocalDateTime loginTime;
    private LocalDateTime logoutTime;
    private String loginType;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public FalxdrEndpoint getEndpoint() { return endpoint; }
    public void setEndpoint(FalxdrEndpoint endpoint) { this.endpoint = endpoint; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public LocalDateTime getLoginTime() { return loginTime; }
    public void setLoginTime(LocalDateTime loginTime) { this.loginTime = loginTime; }
    public LocalDateTime getLogoutTime() { return logoutTime; }
    public void setLogoutTime(LocalDateTime logoutTime) { this.logoutTime = logoutTime; }
    public String getLoginType() { return loginType; }
    public void setLoginType(String loginType) { this.loginType = loginType; }
}