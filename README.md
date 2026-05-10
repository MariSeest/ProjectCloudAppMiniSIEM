# ProjectCloudAppMiniSIEM
# MiniSIEM — Cloud-Native Security Information & Event Management

Progetto universitario per il corso **Architetture Native Cloud** — Università di Torino / HPC4AI.
Stack a microservizi deployato su Kubernetes (Talos + Cilium) nel namespace `group-5`.

## Architettura
Browser → Kubernetes Gateway API (HTTPRoute) → Spring Cloud Gateway (:8080)
├── siem-service       (:8083)
├── incident-service   (:8082)
└── vulnerability-service (:8081)
PostgreSQL 16 · Redis 7 · OpenCTI
### Microservizi

| Servizio | Porta | Tecnologia | Responsabilità |
|---|---|---|---|
| `frontend` | 80 | React 19 + TypeScript + Vite | UI, routing, autenticazione JWT |
| `gateway` | 8080 | Spring Cloud Gateway + Redis | Reverse proxy, rate limiting |
| `siem-service` | 8083 | Spring Boot 3.2 + JPA | Auth, eventi, alert, falxdr, ACN reports, AI |
| `incident-service` | 8082 | Spring Boot 3.5 + WebFlux | Incidenti, correlazioni, commenti, archivio |
| `vulnerability-service` | 8081 | Spring Boot 3.5 | CVE feed via OpenCTI GraphQL |

## Funzionalità principali

- **Dashboard** — statistiche real-time su eventi, alert, incidenti, endpoint
- **Events & Alerts** — visualizzazione e gestione con severity e status workflow
- **Incidents** — CRUD completo, take-charge, archivio, correlazioni tra incidenti, commenti
- **CVEs** — integrazione OpenCTI GraphQL con severity calcolata da CVSS score
- **FalXDR Endpoints** — inventario endpoint, applicazioni installate, login history, browser history, command history
- **Identity Management** — gestione account con password strength e force reset
- **ACN Reports** — compilazione notifiche NIS2/ACN (sezioni A-L) con workflow DRAFT → SUBMITTED
- **Correlation Workspace** — collegamento manuale tra incidenti correlati
- **Audit Log** — tracciamento azioni per tenant
- **AI Analysis** — integrazione Anthropic API per analisi incidenti
- **Cyber News** — feed notizie cybersecurity
- **Risk Predictor** — stima del rischio

## Struttura repository
├── apps/
│   ├── frontend/          # React 19 + Vite + TypeScript
│   ├── gateway/           # Spring Cloud Gateway
│   ├── siem-service/      # Servizio principale SIEM
│   ├── incident-service/  # Gestione incidenti
│   └── vulnerability-service/ # CVE / OpenCTI
├── k8s/                   # Manifest Kubernetes raw
├── gitops/
│   ├── argocd/            # Tre metodologie ArgoCD
│   │   ├── application.yaml        # Application singola → k8s/
│   │   ├── applicationset.yaml     # ApplicationSet → gitops/apps/*/
│   │   └── umbrella-application.yaml # Helm umbrella
│   ├── apps/              # Manifest per ApplicationSet
│   └── helm/minisiem/     # Helm chart
└── docker-compose.yml     # Stack locale
## GitOps — tre metodologie ArgoCD

| Metodologia | File | Sorgente |
|---|---|---|
| Application | `gitops/argocd/application.yaml` | `k8s/` |
| ApplicationSet | `gitops/argocd/applicationset.yaml` | `gitops/apps/*/` |
| Helm umbrella | `gitops/argocd/umbrella-application.yaml` | `gitops/helm/minisiem/` |

La chart Helm usa una struttura **flat** (template diretti, no subchart) con `values.yaml` come single source of truth. Tutti i componenti condividono namespace e ciclo di rilascio, quindi il pattern umbrella con subchart indipendenti non aggiungeva valore in questo contesto.


## Variabili d'ambiente

| Variabile | Servizio | Descrizione |
|---|---|---|
| `OPENCTI_URL` | vulnerability-service | URL GraphQL OpenCTI |
| `OPENCTI_TOKEN` | vulnerability-service | Token Bearer OpenCTI |
| `JWT_SECRET` | siem-service | Secret per firma JWT |
| `DB_URL` / `DB_USERNAME` / `DB_PASSWORD` | siem-service, incident-service | Connessione PostgreSQL |

## Stack tecnologico

- **Frontend**: React 19, TypeScript, Vite (rolldown), React Router 7, Axios, jsPDF, docx
- **Backend**: Spring Boot 3.x, Spring Cloud Gateway, Spring Data JPA, Spring Security, Flyway, jjwt
- **Database**: PostgreSQL 16, Redis 7
- **Infrastruttura**: Kubernetes, Talos, Cilium, ArgoCD, Helm, Docker
- **Integrazioni**: OpenCTI (GraphQL), Anthropic API
