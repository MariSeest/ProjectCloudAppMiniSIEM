package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "falxdr_browser_history")
public class FalxdrBrowserHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false) private FalxdrEndpoint endpoint;
    @Column(nullable = false, columnDefinition = "TEXT") private String url;
    private String title;
    @Column(nullable = false) private LocalDateTime visitedAt;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public FalxdrEndpoint getEndpoint() { return endpoint; }
    public void setEndpoint(FalxdrEndpoint endpoint) { this.endpoint = endpoint; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDateTime getVisitedAt() { return visitedAt; }
    public void setVisitedAt(LocalDateTime visitedAt) { this.visitedAt = visitedAt; }
}