# MiniSIEM v2 — Helm Umbrella Chart

## Panoramica

Umbrella Helm Chart di MiniSIEM v2, piattaforma cloud-native per la sicurezza informatica.
Ogni microservizio e' un subchart indipendente con propria configurazione e labels.

## Struttura

minisiem/
├── Chart.yaml              # Umbrella chart + dipendenze subcharts
├── values.yaml             # Valori globali e override per subchart
├── README.md
├── templates/
│   └── _helpers.tpl        # Helper condivisi
└── charts/
├── siem-service/
├── incident-service/
├── vulnerability-service/
├── gateway/
├── frontend/
├── redis/
└── postgres/

## Prerequisiti

Secret minisiem-secrets nel namespace:

kubectl create secret generic minisiem-secrets \
--from-literal=db-password=<PASSWORD> \
--from-literal=jwt-secret=<JWT_SECRET> \
--from-literal=opencti-token=<TOKEN> \
-n group-5

## Installazione

helm dependency build
helm install minisiem . -n group-5

## Disabilitare un componente

helm upgrade minisiem . -n group-5 --set frontend.enabled=false

## Labels

Tutte le risorse hanno:
- app.kubernetes.io/part-of: minisiem
- app.kubernetes.io/managed-by: Helm
- app.kubernetes.io/component: <ruolo>
- app.kubernetes.io/name: <subchart>
- app.kubernetes.io/instance: <release>
- helm.sh/chart: minisiem-1.0.0

kubectl get all -l app.kubernetes.io/part-of=minisiem -n group-5