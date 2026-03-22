ALTER TABLE incidents ADD COLUMN IF NOT EXISTS taken_charge_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS taken_charge_by varchar(100);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS taken_charge_duration_minutes integer;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS archived_by varchar(100);

CREATE TABLE IF NOT EXISTS incident_correlations (
                                                     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id_1 uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    incident_id_2 uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    correlation_type varchar(255) NOT NULL,
    created_by varchar(100),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(incident_id_1, incident_id_2)
    );

CREATE TABLE IF NOT EXISTS incident_comments (
                                                 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id uuid NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_username varchar(100) NOT NULL,
    author_name varchar(255),
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
    );