import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentsApi } from '../api'
import { SeverityBadge, StatusBadge } from '../components/shared'

export default function ArchivedTickets() {
    const navigate = useNavigate()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        incidentsApi.listArchived().then(setItems).catch(() => setItems([])).finally(() => setLoading(false))
    }, [])

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Archived Tickets</h1>
                    <p className="page-subtitle">Closed and archived incidents, sorted by archive date</p>
                </div>
                <div className="page-actions">
                    <button className="btn" onClick={() => navigate('/incidents')}>← Active Incidents</button>
                </div>
            </div>

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Archived Incidents</span>
                    <span className="card-count">{items.length} total</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th style={{ width: 100 }}>Severity</th>
                            <th style={{ width: 100 }}>Status</th>
                            <th style={{ width: 160 }}>Archived At</th>
                            <th style={{ width: 130 }}>Archived By</th>
                            <th style={{ width: 80 }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0
                            ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state__icon">🗃️</div>No archived tickets yet</div></td></tr>
                            : items.map((i: any) => (
                                <tr key={i.id}>
                                    <td style={{ fontWeight: 600, maxWidth: 280 }}>{i.title}</td>
                                    <td><SeverityBadge severity={i.severity} /></td>
                                    <td><StatusBadge status={i.status} /></td>
                                    <td className="mono" style={{ fontSize: 11 }}>{i.archivedAt ? new Date(i.archivedAt).toLocaleString() : '—'}</td>
                                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>{i.archivedByName || '—'}</td>
                                    <td><button className="btn btn-xs" onClick={() => navigate(`/incidents/${i.id}`)}>View</button></td>
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