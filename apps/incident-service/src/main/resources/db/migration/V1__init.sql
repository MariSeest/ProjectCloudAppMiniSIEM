CREATE TABLE IF NOT EXISTS incidents (
                                         id UUID PRIMARY KEY,
                                         title VARCHAR(120) NOT NULL,
    description VARCHAR(2000),
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS incident_cves (
                                             incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    cve_id VARCHAR(40) NOT NULL,
    PRIMARY KEY (incident_id, cve_id)
    );

CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_cves_cve_id ON incident_cves(cve_id);
