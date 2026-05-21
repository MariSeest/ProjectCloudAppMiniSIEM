{{- define "incident-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "incident-service.fullname" -}}
{{- printf "%s-%s" .Release.Name "incident-service" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "incident-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "incident-service.labels" -}}
helm.sh/chart: {{ include "incident-service.chart" . }}
app.kubernetes.io/name: incident-service
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: backend
app.kubernetes.io/part-of: minisiem
{{- end }}

{{- define "incident-service.selectorLabels" -}}
app.kubernetes.io/name: incident-service
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
