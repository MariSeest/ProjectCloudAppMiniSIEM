CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tenants (
                         id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                         name VARCHAR(255) NOT NULL UNIQUE,
                         slug VARCHAR(100) NOT NULL UNIQUE,
                         created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                       username VARCHAR(100) NOT NULL UNIQUE,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(255),
                       role VARCHAR(50) NOT NULL DEFAULT 'READ_ONLY',
                       tenant_id UUID REFERENCES tenants(id),
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT NOW(),
                       last_login TIMESTAMP
);

CREATE TABLE events (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        tenant_id UUID NOT NULL REFERENCES tenants(id),
                        title VARCHAR(500) NOT NULL,
                        source VARCHAR(255),
                        severity VARCHAR(50) NOT NULL,
                        description TEXT,
                        raw_data JSONB,
                        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
                        created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE alerts (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        tenant_id UUID NOT NULL REFERENCES tenants(id),
                        title VARCHAR(500) NOT NULL,
                        severity VARCHAR(50) NOT NULL,
                        status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
                        description TEXT,
                        source VARCHAR(255),
                        event_id UUID REFERENCES events(id),
                        assigned_to UUID REFERENCES users(id),
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW(),
                        resolved_at TIMESTAMP
);

CREATE TABLE incidents (
                           id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                           tenant_id UUID NOT NULL REFERENCES tenants(id),
                           title VARCHAR(500) NOT NULL,
                           severity VARCHAR(50) NOT NULL,
                           status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
                           description TEXT,
                           cve_ids TEXT[],
                           assigned_to UUID REFERENCES users(id),
                           taken_charge_at TIMESTAMP,
                           taken_charge_by UUID REFERENCES users(id),
                           taken_charge_duration_minutes INTEGER,
                           archived BOOLEAN DEFAULT FALSE,
                           archived_at TIMESTAMP,
                           archived_by UUID REFERENCES users(id),
                           created_at TIMESTAMP DEFAULT NOW(),
                           updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE incident_correlations (
                                       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                       tenant_id UUID NOT NULL REFERENCES tenants(id),
                                       incident_id_1 UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
                                       incident_id_2 UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
                                       correlation_type VARCHAR(255) NOT NULL,
                                       created_by UUID REFERENCES users(id),
                                       created_at TIMESTAMP DEFAULT NOW(),
                                       UNIQUE(incident_id_1, incident_id_2)
);

CREATE TABLE comments (
                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                          entity_type VARCHAR(50) NOT NULL,
                          entity_id UUID NOT NULL,
                          tenant_id UUID NOT NULL REFERENCES tenants(id),
                          author_id UUID NOT NULL REFERENCES users(id),
                          content TEXT NOT NULL,
                          created_at TIMESTAMP DEFAULT NOW(),
                          updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            tenant_id UUID REFERENCES tenants(id),
                            user_id UUID REFERENCES users(id),
                            username VARCHAR(100),
                            action VARCHAR(255) NOT NULL,
                            entity_type VARCHAR(100),
                            entity_id UUID,
                            details JSONB,
                            ip_address VARCHAR(50),
                            timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE acn_reports (
                             id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                             tenant_id UUID NOT NULL REFERENCES tenants(id),
                             incident_id UUID REFERENCES incidents(id),
                             notification_id VARCHAR(100),
                             status VARCHAR(50) DEFAULT 'DRAFT',
                             notification_type VARCHAR(100),
                             section_a JSONB, section_b JSONB, section_c JSONB, section_d JSONB,
                             section_e JSONB, section_f JSONB, section_g JSONB, section_h JSONB,
                             section_i JSONB, section_l JSONB,
                             created_by UUID REFERENCES users(id),
                             created_at TIMESTAMP DEFAULT NOW(),
                             updated_at TIMESTAMP DEFAULT NOW(),
                             submitted_at TIMESTAMP
);

CREATE TABLE falxdr_endpoints (
                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                  tenant_id UUID NOT NULL REFERENCES tenants(id),
                                  hostname VARCHAR(255) NOT NULL,
                                  ip_address VARCHAR(50),
                                  mac_address VARCHAR(50),
                                  os VARCHAR(100),
                                  os_version VARCHAR(100),
                                  hardware_model VARCHAR(255),
                                  cpu VARCHAR(255),
                                  ram_gb INTEGER,
                                  disk_gb INTEGER,
                                  agent_version VARCHAR(50),
                                  agent_status VARCHAR(50) DEFAULT 'ACTIVE',
                                  last_seen TIMESTAMP,
                                  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE falxdr_applications (
                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                     endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
                                     name VARCHAR(255) NOT NULL,
                                     version VARCHAR(100),
                                     publisher VARCHAR(255),
                                     install_date DATE,
                                     is_installed BOOLEAN DEFAULT TRUE
);

CREATE TABLE falxdr_login_history (
                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                      endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
                                      username VARCHAR(255) NOT NULL,
                                      login_time TIMESTAMP NOT NULL,
                                      logout_time TIMESTAMP,
                                      login_type VARCHAR(50)
);

CREATE TABLE falxdr_commands (
                                 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                 endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
                                 username VARCHAR(255),
                                 command TEXT NOT NULL,
                                 executed_at TIMESTAMP NOT NULL
);

CREATE TABLE falxdr_browser_history (
                                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
                                        url TEXT NOT NULL,
                                        title VARCHAR(500),
                                        visited_at TIMESTAMP NOT NULL
);

CREATE TABLE identity_assets (
                                 id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                 tenant_id UUID NOT NULL REFERENCES tenants(id),
                                 endpoint_id UUID REFERENCES falxdr_endpoints(id),
                                 username VARCHAR(255) NOT NULL,
                                 full_name VARCHAR(255),
                                 password_strength VARCHAR(50),
                                 last_password_change TIMESTAMP,
                                 force_reset_requested BOOLEAN DEFAULT FALSE,
                                 force_reset_at TIMESTAMP
);

INSERT INTO tenants (id, name, slug) VALUES
                                         ('00000000-0000-0000-0000-000000000001','Admin Tenant','admin'),
                                         ('00000000-0000-0000-0000-000000000002','Satremar','satremar');

INSERT INTO users (id, username, email, password_hash, full_name, role, tenant_id) VALUES
                                                                                       ('00000000-0000-0000-0001-000000000001','admin','admin@minisiem.local',
                                                                                        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCi/5Lm.9KeFkRp5Sip5eDe','Administrator','ADMIN','00000000-0000-0000-0000-000000000001'),
                                                                                       ('00000000-0000-0000-0001-000000000002','luisa.mele','luisa.mele@minisiem.local',
                                                                                        '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCi/5Lm.9KeFkRp5Sip5eDe','Luisa Mele','ANALYST','00000000-0000-0000-0000-000000000002');

INSERT INTO events (tenant_id, title, source, severity, description, timestamp) VALUES
                                                                                    ('00000000-0000-0000-0000-000000000002','Failed SSH login attempt','firewall-01','HIGH','Multiple failed SSH login attempts from 192.168.1.100',NOW()-INTERVAL '2 hours'),
                                                                                    ('00000000-0000-0000-0000-000000000002','Port scan detected','ids-sensor-01','MEDIUM','Nmap scan detected from 203.0.113.5',NOW()-INTERVAL '4 hours'),
                                                                                    ('00000000-0000-0000-0000-000000000002','Malware signature detected','endpoint-av','CRITICAL','Trojan.GenericKD detected on WS-042',NOW()-INTERVAL '1 hour'),
                                                                                    ('00000000-0000-0000-0000-000000000002','Unusual outbound traffic','network-monitor','HIGH','Large data exfiltration attempt to 198.51.100.0',NOW()-INTERVAL '30 minutes'),
                                                                                    ('00000000-0000-0000-0000-000000000002','User privilege escalation','windows-event-log','HIGH','User jsmith attempted privilege escalation on SERVER-01',NOW()-INTERVAL '6 hours');

INSERT INTO alerts (tenant_id, title, severity, status, description, source) VALUES
                                                                                 ('00000000-0000-0000-0000-000000000002','Brute Force Attack Detected','HIGH','OPEN','Brute force attack on SSH service','firewall-01'),
                                                                                 ('00000000-0000-0000-0000-000000000002','Suspicious DNS Query','MEDIUM','OPEN','DNS query to known C2 domain','dns-monitor'),
                                                                                 ('00000000-0000-0000-0000-000000000002','Ransomware Activity','CRITICAL','OPEN','File encryption activity on multiple endpoints','edr-01');

INSERT INTO incidents (id, tenant_id, title, severity, status, description, cve_ids) VALUES
                                                                                         ('ec0a2697-3263-4760-b4e1-8a0267cf733d','00000000-0000-0000-0000-000000000002','aaa','HIGH','OPEN','Investigate exposure...',ARRAY['CVE-2024-39174']),
                                                                                         ('2e89e1a4-bb7a-42e4-9997-782844356152','00000000-0000-0000-0000-000000000002','UPDATED via PATCH','MEDIUM','RESOLVED','Vulnerability investigation completed',ARRAY['CVE-2024-0003']);

INSERT INTO falxdr_endpoints (tenant_id, hostname, ip_address, mac_address, os, os_version, hardware_model, cpu, ram_gb, disk_gb, agent_version, agent_status, last_seen) VALUES
                                                                                                                                                                              ('00000000-0000-0000-0000-000000000002','WKSTN-001','192.168.1.10','AA:BB:CC:DD:EE:01','Windows','11 Pro 23H2','Dell Latitude 5540','Intel Core i7-1365U',16,512,'1.2.3','ACTIVE',NOW()-INTERVAL '5 minutes'),
                                                                                                                                                                              ('00000000-0000-0000-0000-000000000002','SRV-DC01','192.168.1.5','AA:BB:CC:DD:EE:02','Windows Server','2022 Standard','Dell PowerEdge R750','Intel Xeon Silver 4314',64,2048,'1.2.3','ACTIVE',NOW()-INTERVAL '1 minute'),
                                                                                                                                                                              ('00000000-0000-0000-0000-000000000002','WKSTN-042','192.168.1.42','AA:BB:CC:DD:EE:03','Windows','10 Pro 22H2','HP EliteBook 840 G9','Intel Core i5-1235U',8,256,'1.2.1','STALE',NOW()-INTERVAL '2 days');

INSERT INTO falxdr_applications (endpoint_id, name, version, publisher, is_installed)
SELECT id,'Microsoft Office 365','16.0.17126','Microsoft',true FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'Google Chrome','124.0.6367','Google',true FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'7-Zip','23.01','Igor Pavlov',true FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'Active Directory Services','10.0.20348','Microsoft',true FROM falxdr_endpoints WHERE hostname='SRV-DC01';

INSERT INTO falxdr_login_history (endpoint_id, username, login_time, logout_time, login_type)
SELECT id,'jsmith',NOW()-INTERVAL '3 hours',NOW()-INTERVAL '1 hour','Interactive' FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'administrator',NOW()-INTERVAL '8 hours',NOW()-INTERVAL '6 hours','Remote' FROM falxdr_endpoints WHERE hostname='SRV-DC01';

INSERT INTO falxdr_commands (endpoint_id, username, command, executed_at)
SELECT id,'jsmith','net user /domain',NOW()-INTERVAL '2 hours' FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'jsmith','ipconfig /all',NOW()-INTERVAL '2 hours 30 minutes' FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'administrator','Get-ADUser -Filter *',NOW()-INTERVAL '7 hours' FROM falxdr_endpoints WHERE hostname='SRV-DC01';

INSERT INTO falxdr_browser_history (endpoint_id, url, title, visited_at)
SELECT id,'https://mail.google.com','Gmail',NOW()-INTERVAL '1 hour' FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'https://pastebin.com/xK9mP2qR','Pastebin',NOW()-INTERVAL '1 hour 30 minutes' FROM falxdr_endpoints WHERE hostname='WKSTN-001'
UNION ALL
SELECT id,'https://github.com','GitHub',NOW()-INTERVAL '2 hours' FROM falxdr_endpoints WHERE hostname='WKSTN-001';

INSERT INTO identity_assets (tenant_id, endpoint_id, username, full_name, password_strength, last_password_change)
SELECT '00000000-0000-0000-0000-000000000002', e.id, 'jsmith', 'John Smith', 'WEAK', NOW()-INTERVAL '180 days'
FROM falxdr_endpoints e WHERE e.hostname='WKSTN-001'
UNION ALL
SELECT '00000000-0000-0000-0000-000000000002', e.id, 'administrator', 'Local Admin', 'MEDIUM', NOW()-INTERVAL '90 days'
FROM falxdr_endpoints e WHERE e.hostname='SRV-DC01'
UNION ALL
SELECT '00000000-0000-0000-0000-000000000002', e.id, 'luisa.mele', 'Luisa Mele', 'STRONG', NOW()-INTERVAL '30 days'
FROM falxdr_endpoints e WHERE e.hostname='WKSTN-001';