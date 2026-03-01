-- V1__init.sql
-- Baseline schema for incident-service

-- 1) incidents
CREATE TABLE IF NOT EXISTS public.incidents (
                                                id uuid NOT NULL,
                                                title varchar(120) NOT NULL,
    description varchar(2000),
    severity varchar(16) NOT NULL,
    status varchar(16) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT incidents_pkey PRIMARY KEY (id)
    );

-- Index as seen in DB
CREATE INDEX IF NOT EXISTS idx_incidents_created_at
    ON public.incidents (created_at DESC);

-- 2) incident_cves
CREATE TABLE IF NOT EXISTS public.incident_cves (
                                                    incident_id uuid NOT NULL,
                                                    cve_id varchar(40) NOT NULL,
    CONSTRAINT incident_cves_pkey PRIMARY KEY (incident_id, cve_id)
    );

CREATE INDEX IF NOT EXISTS idx_incident_cves_cve_id
    ON public.incident_cves (cve_id);

-- FK (idempotent with a guard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'incident_cves_incident_id_fkey'
      AND conrelid = 'public.incident_cves'::regclass
  ) THEN
ALTER TABLE public.incident_cves
    ADD CONSTRAINT incident_cves_incident_id_fkey
        FOREIGN KEY (incident_id)
            REFERENCES public.incidents(id)
            ON DELETE CASCADE;
END IF;
END $$;