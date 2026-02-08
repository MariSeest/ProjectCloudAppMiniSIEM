create table incidents (
                           id           varchar(20) primary key,
                           title        varchar(120) not null,
                           description  varchar(2000),
                           severity     varchar(20) not null,
                           status       varchar(20) not null,
                           created_at   timestamptz not null default now()
);

create table incident_cves (
                               incident_id varchar(20) not null references incidents(id) on delete cascade,
                               cve_id      varchar(40) not null,
                               primary key (incident_id, cve_id)
);
