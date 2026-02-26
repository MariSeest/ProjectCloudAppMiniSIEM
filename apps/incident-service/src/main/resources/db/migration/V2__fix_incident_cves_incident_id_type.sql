-- Se incident_cves.incident_id è varchar, lo porta a uuid
ALTER TABLE incident_cves
ALTER COLUMN incident_id TYPE uuid
  USING incident_id::uuid;
