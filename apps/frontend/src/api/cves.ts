import api from './client'

export const cvesApi = {
    search: (keyword: string) =>
        fetch(
            `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=20`
        ).then((r) => r.json()),
}

export async function listCves(params: { query?: string; limit?: number } = {}) {
    const query = (params.query ?? '').trim()
    const limit = params.limit ?? 10
    const qs = new URLSearchParams()
    if (query.length > 0) qs.set('query', query)
    qs.set('limit', String(limit))
    return api.get(`/cves?${qs.toString()}`).then((r) => r.data)
}