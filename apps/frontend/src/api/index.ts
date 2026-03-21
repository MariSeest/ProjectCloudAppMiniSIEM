import api from './client'

export const incidentsApi = {
    list: () => api.get('/incidents').then((r) => r.data),
    listArchived: () => api.get('/incidents/archived').then((r) => r.data),
    get: (id: string) => api.get(`/incidents/${id}`).then((r) => r.data),
    create: (data: object) => api.post('/incidents', data).then((r) => r.data),
    update: (id: string, data: object) => api.patch(`/incidents/${id}`, data).then((r) => r.data),
    takeCharge: (id: string, data: object) => api.post(`/incidents/${id}/take-charge`, data).then((r) => r.data),
    archive: (id: string) => api.post(`/incidents/${id}/archive`).then((r) => r.data),
    delete: (id: string) => api.delete(`/incidents/${id}`),
    correlate: (data: object) => api.post('/incidents/correlate', data).then((r) => r.data),
    deleteCorrelation: (id: string) => api.delete(`/incidents/correlations/${id}`),
}

export const eventsApi = {
    list: (page = 0, size = 50) => api.get(`/events?page=${page}&size=${size}`).then((r) => r.data),
    get: (id: string) => api.get(`/events/${id}`).then((r) => r.data),
    getComments: (id: string) => api.get(`/events/${id}/comments`).then((r) => r.data),
    addComment: (id: string, content: string) =>
        api.post(`/events/${id}/comments`, { content }).then((r) => r.data),
}

export const alertsApi = {
    list: (page = 0, size = 100) => api.get(`/alerts?page=${page}&size=${size}`).then((r) => r.data),
    get: (id: string) => api.get(`/alerts/${id}`).then((r) => r.data),
    updateStatus: (id: string, status: string) =>
        api.patch(`/alerts/${id}/status`, { status }).then((r) => r.data),
    getComments: (id: string) => api.get(`/alerts/${id}/comments`).then((r) => r.data),
    addComment: (id: string, content: string) =>
        api.post(`/alerts/${id}/comments`, { content }).then((r) => r.data),
}

export const dashboardApi = {
    stats: () => api.get('/dashboard/stats').then((r) => r.data),
}

export const auditApi = {
    list: (page = 0, size = 50) => api.get(`/audit?page=${page}&size=${size}`).then((r) => r.data),
}

export const acnApi = {
    list: () => api.get('/acn').then((r) => r.data),
    get: (id: string) => api.get(`/acn/${id}`).then((r) => r.data),
    create: (data: object) => api.post('/acn', data).then((r) => r.data),
    update: (id: string, data: object) => api.put(`/acn/${id}`, data).then((r) => r.data),
    submit: (id: string) => api.post(`/acn/${id}/submit`).then((r) => r.data),
}

export const usersApi = {
    list: () => api.get('/users').then((r) => r.data),
    create: (data: object) => api.post('/users', data).then((r) => r.data),
    update: (id: string, data: object) => api.put(`/users/${id}`, data).then((r) => r.data),
    delete: (id: string) => api.delete(`/users/${id}`),
    tenants: () => api.get('/users/tenants').then((r) => r.data),
}

export const falxdrApi = {
    endpoints: () => api.get('/falxdr/endpoints').then((r) => r.data),
    endpointDetail: (id: string) => api.get(`/falxdr/endpoints/${id}`).then((r) => r.data),
    installApp: (endpointId: string, appName: string) =>
        api.post(`/falxdr/endpoints/${endpointId}/install-app`, { appName }).then((r) => r.data),
    removeApp: (endpointId: string, appId: string) =>
        api.delete(`/falxdr/endpoints/${endpointId}/apps/${appId}`).then((r) => r.data),
    discover: () => api.get('/falxdr/discover').then((r) => r.data),
    installAgent: (id: string) =>
        api.post(`/falxdr/endpoints/${id}/install-agent`).then((r) => r.data),
}

export const identityApi = {
    list: () => api.get('/identity').then((r) => r.data),
    forceReset: (id: string) => api.post(`/identity/${id}/force-reset`).then((r) => r.data),
}

export const cvesApi = {
    search: (keyword: string) =>
        fetch(
            `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`
        ).then((r) => r.json()),
}