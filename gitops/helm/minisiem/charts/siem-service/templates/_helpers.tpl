{{- define "siem-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "siem-service.fullname" -}}
{{- printf "%s-%s" .Release.Name "siem-service" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "siem-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "siem-service.labels" -}}
helm.sh/chart: {{ include "siem-service.chart" . }}
app.kubernetes.io/name: siem-service
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: backend
app.kubernetes.io/part-of: minisiem
{{- end }}

{{- define "siem-service.selectorLabels" -}}
app.kubernetes.io/name: siem-service
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
