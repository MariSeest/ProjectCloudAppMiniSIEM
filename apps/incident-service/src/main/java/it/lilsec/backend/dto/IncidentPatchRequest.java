package it.lilsec.backend.dto;

import it.lilsec.backend.model.IncidentStatus;
import it.lilsec.backend.model.Severity;

import java.util.List;

public class IncidentPatchRequest {

    private String title;
    private String description;
    private Severity severity;
    private IncidentStatus status;
    private List<String> cveIds;

    public IncidentPatchRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }

    public List<String> getCveIds() { return cveIds; }
    public void setCveIds(List<String> cveIds) { this.cveIds = cveIds; }
}