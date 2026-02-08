CREATE TABLE incidents (
                           id           VARCHAR(36) PRIMARY KEY,
                           title        VARCHAR(120) NOT NULL,
                           description  VARCHAR(2000),
                           severity     VARCHAR(16) NOT NULL,
                           status       VARCHAR(16) NOT NULL,
                           created_at   TIMESTAMP(6) NOT NULL,
                           cve_ids_csv  VARCHAR(2000)
);
