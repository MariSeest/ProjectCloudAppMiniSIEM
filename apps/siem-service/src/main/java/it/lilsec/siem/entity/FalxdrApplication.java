package it.lilsec.siem.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "falxdr_applications")
public class FalxdrApplication {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "endpoint_id", nullable = false) private FalxdrEndpoint endpoint;
    @Column(nullable = false) private String name;
    private String version, publisher;
    private LocalDate installDate;
    @Column(nullable = false) private Boolean isInstalled = true;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public FalxdrEndpoint getEndpoint() { return endpoint; }
    public void setEndpoint(FalxdrEndpoint endpoint) { this.endpoint = endpoint; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public LocalDate getInstallDate() { return installDate; }
    public void setInstallDate(LocalDate installDate) { this.installDate = installDate; }
    public Boolean getIsInstalled() { return isInstalled; }
    public void setIsInstalled(Boolean isInstalled) { this.isInstalled = isInstalled; }
}