package it.lilsec.backend.dto;

import java.util.Set;

public class IncidentPatchRequest {
    private String title;
    private String description;
    private String severity; // oppure enum se già usi enum
    private String status;   // idem
    private Set<String> cveIds;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Set<String> getCveIds() { return cveIds; }
    public void setCveIds(Set<String> cveIds) { this.cveIds = cveIds; }
}