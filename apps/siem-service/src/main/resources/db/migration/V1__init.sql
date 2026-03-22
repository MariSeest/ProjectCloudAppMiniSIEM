CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS siem_users (
                                          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'READ_ONLY',
    tenant_id VARCHAR(100),
    tenant_name VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS siem_audit_logs (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100),
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    tenant_id VARCHAR(100),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS siem_acn_reports (
                                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    notification_type VARCHAR(100),
    section_a TEXT,
    section_b TEXT,
    section_c TEXT,
    section_d TEXT,
    section_e TEXT,
    section_f TEXT,
    section_g TEXT,
    section_h TEXT,
    section_i TEXT,
    section_l TEXT,
    created_by VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMP
    );

CREATE TABLE IF NOT EXISTS falxdr_endpoints (
                                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS falxdr_applications (
                                                   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(100),
    publisher VARCHAR(255),
    install_date DATE,
    is_installed BOOLEAN NOT NULL DEFAULT TRUE
    );

CREATE TABLE IF NOT EXISTS falxdr_login_history (
                                                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    login_time TIMESTAMP NOT NULL,
    logout_time TIMESTAMP,
    login_type VARCHAR(50)
    );

CREATE TABLE IF NOT EXISTS falxdr_commands (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
    username VARCHAR(255),
    command TEXT NOT NULL,
    executed_at TIMESTAMP NOT NULL
    );

CREATE TABLE IF NOT EXISTS falxdr_browser_history (
                                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint_id UUID NOT NULL REFERENCES falxdr_endpoints(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title VARCHAR(500),
    visited_at TIMESTAMP NOT NULL
    );

CREATE TABLE IF NOT EXISTS identity_assets (
                                               id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(100) NOT NULL,
    endpoint_id UUID REFERENCES falxdr_endpoints(id),
    username VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    password_strength VARCHAR(50),
    last_password_change TIMESTAMP,
    force_reset_requested BOOLEAN NOT NULL DEFAULT FALSE,
    force_reset_at TIMESTAMP
    );

-- Seed users (password = admin123, BCrypt)
INSERT INTO siem_users (id, username, email, password_hash, full_name, role, tenant_id, tenant_name)
VALUES
    ('00000000-0000-0000-0001-000000000001', 'admin', 'admin@minisiem.local',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCi/5Lm.9KeFkRp5Sip5eDe',
     'Administrator', 'ADMIN', '00000000-0000-0000-0000-000000000001', 'Admin Tenant'),
    ('00000000-0000-0000-0001-000000000002', 'luisa.mele', 'luisa.mele@minisiem.local',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCi/5Lm.9KeFkRp5Sip5eDe',
     'Luisa Mele', 'ANALYST', '00000000-0000-0000-0000-000000000002', 'Satremar')
    ON CONFLICT (username) DO NOTHING;

-- Seed endpoints
INSERT INTO falxdr_endpoints (id, tenant_id, hostname, ip_address, mac_address, os, os_version, hardware_model, cpu, ram_gb, disk_gb, agent_version, agent_status, last_seen)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
     'WKSTN-001', '192.168.1.10', 'AA:BB:CC:DD:EE:01',
     'Windows', '11 Pro 23H2', 'Dell Latitude 5540', 'Intel Core i7-1365U',
     16, 512, '1.2.3', 'ACTIVE', NOW() - INTERVAL '5 minutes'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
     'SRV-DC01', '192.168.1.5', 'AA:BB:CC:DD:EE:02',
     'Windows Server', '2022 Standard', 'Dell PowerEdge R750', 'Intel Xeon Silver 4314',
     64, 2048, '1.2.3', 'ACTIVE', NOW() - INTERVAL '1 minute'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002',
     'WKSTN-042', '192.168.1.42', 'AA:BB:CC:DD:EE:03',
     'Windows', '10 Pro 22H2', 'HP EliteBook 840 G9', 'Intel Core i5-1235U',
     8, 256, '1.2.1', 'STALE', NOW() - INTERVAL '2 days')
    ON CONFLICT DO NOTHING;

-- Seed applications
INSERT INTO falxdr_applications (endpoint_id, name, version, publisher, install_date, is_installed)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'Microsoft Office 365', '16.0.17231', 'Microsoft Corporation', '2024-01-15', true),
    ('10000000-0000-0000-0000-000000000001', 'Google Chrome', '124.0.6367', 'Google LLC', '2024-03-10', true),
    ('10000000-0000-0000-0000-000000000001', 'Notepad++', '8.6.2', 'Don Ho', '2023-11-20', true),
    ('10000000-0000-0000-0000-000000000002', 'Active Directory Domain Services', '10.0', 'Microsoft', '2023-06-01', true),
    ('10000000-0000-0000-0000-000000000002', 'SQL Server 2022', '16.0.1000', 'Microsoft', '2023-06-01', true)
    ON CONFLICT DO NOTHING;

-- Seed login history
INSERT INTO falxdr_login_history (endpoint_id, username, login_time, logout_time, login_type)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'jsmith', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '30 minutes', 'Interactive'),
    ('10000000-0000-0000-0000-000000000001', 'jsmith', NOW() - INTERVAL '1 day', NOW() - INTERVAL '23 hours', 'Interactive'),
    ('10000000-0000-0000-0000-000000000002', 'administrator', NOW() - INTERVAL '10 minutes', NULL, 'Interactive'),
    ('10000000-0000-0000-0000-000000000002', 'svc_backup', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', 'Service')
    ON CONFLICT DO NOTHING;

-- Seed commands
INSERT INTO falxdr_commands (endpoint_id, username, command, executed_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'jsmith', 'ipconfig /all', NOW() - INTERVAL '3 hours'),
    ('10000000-0000-0000-0000-000000000001', 'jsmith', 'netstat -an', NOW() - INTERVAL '2 hours 50 minutes'),
    ('10000000-0000-0000-0000-000000000002', 'administrator', 'Get-ADUser -Filter * | Select Name', NOW() - INTERVAL '15 minutes'),
    ('10000000-0000-0000-0000-000000000002', 'administrator', 'net user /domain', NOW() - INTERVAL '12 minutes')
    ON CONFLICT DO NOTHING;

-- Seed browser history
INSERT INTO falxdr_browser_history (endpoint_id, url, title, visited_at)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'https://mail.google.com', 'Gmail', NOW() - INTERVAL '1 hour'),
    ('10000000-0000-0000-0000-000000000001', 'https://drive.google.com', 'Google Drive', NOW() - INTERVAL '1 hour 30 minutes'),
    ('10000000-0000-0000-0000-000000000001', 'https://pastebin.com/raw/xyz123', 'Pastebin', NOW() - INTERVAL '45 minutes')
    ON CONFLICT DO NOTHING;

-- Seed identity assets
INSERT INTO identity_assets (tenant_id, endpoint_id, username, full_name, password_strength, last_password_change)
VALUES
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
     'jsmith', 'John Smith', 'WEAK', NOW() - INTERVAL '180 days'),
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
     'administrator', 'Local Admin', 'MEDIUM', NOW() - INTERVAL '90 days'),
    ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002',
     'svc_backup', 'Backup Service Account', 'STRONG', NOW() - INTERVAL '30 days')
    ON CONFLICT DO NOTHING;