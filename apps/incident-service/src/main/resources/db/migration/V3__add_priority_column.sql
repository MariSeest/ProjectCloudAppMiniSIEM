ALTER TABLE incidents
    ADD COLUMN IF NOT EXISTS priority varchar(16);

CREATE INDEX IF NOT EXISTS idx_incidents_priority
    ON incidents(priority);