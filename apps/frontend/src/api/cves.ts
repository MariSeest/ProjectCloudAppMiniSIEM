import type { Cve } from '../models/cve'
import api from './client'

export async function listCves(params: { query?: string; limit?: number } = {}): Promise<Cve[]> {
    const query = (params.query ?? '').trim()
    const limit = params.limit ?? 10

    const qs = new URLSearchParams()
    if (query.length > 0) qs.set('query', query)
    qs.set('limit', String(limit))

    return api.get<Cve[]>(`/cves?${qs.toString()}`).then((r) => r.data)
}