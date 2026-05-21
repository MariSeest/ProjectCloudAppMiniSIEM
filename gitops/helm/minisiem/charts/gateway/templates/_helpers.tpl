{{- define "gateway.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "gateway.fullname" -}}
{{- printf "%s-%s" .Release.Name "gateway" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "gateway.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "gateway.labels" -}}
helm.sh/chart: {{ include "gateway.chart" . }}
app.kubernetes.io/name: gateway
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/component: gateway
app.kubernetes.io/part-of: minisiem
{{- end }}

{{- define "gateway.selectorLabels" -}}
app.kubernetes.io/name: gateway
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}