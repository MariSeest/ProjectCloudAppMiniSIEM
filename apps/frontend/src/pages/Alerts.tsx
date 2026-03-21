import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { alertsApi } from '../api'
import { SeverityBadge, StatusBadge } from '../components/shared'

export default function Alerts() {
    const navigate = useNavigate()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const [search, setSearch] = useState('')

    async function load() {
        setLoading(true)
        try { setData(await alertsApi.list(0, 100)) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const items = (data?.content || []).filter((a: any) =>
        (filter === 'ALL' || a.status === filter) &&
        (!search || a.title?.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Alerts</h1>
                    <p className="page-subtitle">Security alerts — click any row for details & comments</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-sm" onClick={load} disabled={loading}>↻ Refresh</button>
                </div>
            </div>

            <div className="filters">
                <input className="input" style={{ width: 260 }} placeholder="🔍 Search alerts…" value={search} onChange={e => setSearch(e.target.value)} />
                {['ALL', 'OPEN', 'ACK', 'RESOLVED'].map(s => (
                    <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : ''}`} onClick={() => setFilter(s)}>{s}</button>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted2)' }}>{items.length} alerts</span>
            </div>

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Alerts</span>
                    <span className="card-count">{items.length} shown</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th style={{ width: 100 }}>Severity</th>
                            <th style={{ width: 100 }}>Status</th>
                            <th style={{ width: 130 }}>Source</th>
                            <th style={{ width: 160 }}>Created</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0
                            ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state__icon">🔔</div>No alerts</div></td></tr>
                            : items.map((a: any) => (
                                <tr key={a.id} className="clickable-row" onClick={() => navigate(`/alerts/${a.id}`)}>
                                    <td style={{ fontWeight: 600 }}>{a.title}</td>
                                    <td><SeverityBadge severity={a.severity} /></td>
                                    <td><StatusBadge status={a.status} /></td>
                                    <td><span className="badge badge-info">{a.source}</span></td>
                                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(a.createdAt).toLocaleString()}</td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}