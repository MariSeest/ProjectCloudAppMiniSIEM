import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api'
import { NumericSeverityBadge } from '../components/shared'

export default function Events() {
    const navigate = useNavigate()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const [filter, setFilter] = useState('')

    async function load(p = 0) {
        setLoading(true)
        try { setData(await eventsApi.list(p, 50)); setPage(p) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const items = (data?.content || []).filter((e: any) =>
        !filter ||
        e.title?.toLowerCase().includes(filter.toLowerCase()) ||
        e.source?.toLowerCase().includes(filter.toLowerCase()) ||
        e.description?.toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Events</h1>
                    <p className="page-subtitle">Normalized security events — click any row to view details & add comments</p>
                </div>
            </div>

            <div className="filters">
                <input
                    className="input"
                    style={{ width: 300 }}
                    placeholder="🔍 Filter by title, source, description…"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                />
                <button className="btn btn-sm" onClick={() => load(0)} disabled={loading}>↻ Refresh</button>
                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted2)' }}>
          {data?.totalElements ?? 0} total events
        </span>
            </div>

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Events</span>
                    <span className="card-count">{items.length} shown</span>
                </div>

                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th style={{ width: 160 }}>Time</th>
                            <th>Title</th>
                            <th style={{ width: 130 }}>Source</th>
                            <th style={{ width: 110 }}>Severity</th>
                            <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0
                            ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state__icon">⚡</div>No events found</div></td></tr>
                            : items.map((e: any) => (
                                <tr key={e.id} className="clickable-row" onClick={() => navigate(`/events/${e.id}`)}>
                                    <td className="mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                        {new Date(e.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ fontWeight: 600, maxWidth: 220 }}>{e.title}</td>
                                    <td><span className="badge badge-info">{e.source}</span></td>
                                    <td><NumericSeverityBadge severity={Number(e.severity) || 0} /></td>
                                    <td style={{ color: 'var(--muted)', maxWidth: 280 }}>{e.description}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                }

                {data && data.totalPages > 1 && (
                    <div style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: '1px solid var(--border)', justifyContent: 'center' }}>
                        <button className="btn btn-sm" disabled={page === 0} onClick={() => load(page - 1)}>← Prev</button>
                        <span style={{ padding: '5px 12px', fontSize: 13, color: 'var(--muted)' }}>Page {page + 1} / {data.totalPages}</span>
                        <button className="btn btn-sm" disabled={page >= data.totalPages - 1} onClick={() => load(page + 1)}>Next →</button>
                    </div>
                )}
            </div>
        </div>
    )
}