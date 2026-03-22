package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "falxdr_commands")
public class FalxdrCommand {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false) private FalxdrEndpoint endpoint;
    private String username;
    @Column(nullable = false, columnDefinition = "TEXT") private String command;
    @Column(nullable = false) private LocalDateTime executedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public FalxdrEndpoint getEndpoint() { return endpoint; }
    public void setEndpoint(FalxdrEndpoint endpoint) { this.endpoint = endpoint; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }
    public LocalDateTime getExecutedAt() { return executedAt; }
    public void setExecutedAt(LocalDateTime executedAt) { this.executedAt = executedAt; }
}