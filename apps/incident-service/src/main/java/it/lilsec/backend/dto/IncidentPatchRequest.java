package it.lilsec.backend.dto;

import it.lilsec.backend.model.Severity;
import it.lilsec.backend.model.Status;

import java.util.Set;

public class IncidentPatchRequest {

    private String title;
    private String description;
    private Severity severity;
    private Status status;
    private Set<String> cveIds;

    public IncidentPatchRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Set<String> getCveIds() { return cveIds; }
    public void setCveIds(Set<String> cveIds) { this.cveIds = cveIds; }
}