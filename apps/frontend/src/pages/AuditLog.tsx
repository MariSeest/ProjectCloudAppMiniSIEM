import { useEffect, useState } from 'react'
import { auditApi } from '../api'

const ACTION_BADGE: Record<string, string> = {
    LOGIN: 'badge-info',
    CREATE_INCIDENT: 'badge-resolved', UPDATE_INCIDENT: 'badge-medium',
    ARCHIVE_INCIDENT: 'badge-closed', DELETE_INCIDENT: 'badge-critical',
    CORRELATE_INCIDENTS: 'badge-info', DELETE_CORRELATION: 'badge-medium',
    CREATE_USER: 'badge-resolved', UPDATE_USER: 'badge-medium', DELETE_USER: 'badge-critical',
    ADD_COMMENT: 'badge-info', SUBMIT_ACN_REPORT: 'badge-resolved',
    FORCE_PASSWORD_RESET: 'badge-high', TAKE_CHARGE_INCIDENT: 'badge-medium',
}

export default function AuditLog() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)

    async function load(p = 0) {
        setLoading(true)
        try { setData(await auditApi.list(p, 50)); setPage(p) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const items = data?.content || []

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Audit Log</h1>
                    <p className="page-subtitle">Complete record of all user actions and system events, saved to DB</p>
                </div>
                <button className="btn btn-sm" onClick={() => load(0)} disabled={loading}>↻ Refresh</button>
            </div>

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Activity Log</span>
                    <span className="card-count">{data?.totalElements ?? 0} entries</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th style={{ width: 160 }}>Timestamp</th>
                            <th style={{ width: 130 }}>User</th>
                            <th style={{ width: 200 }}>Action</th>
                            <th style={{ width: 140 }}>Entity</th>
                            <th style={{ width: 110 }}>IP</th>
                            <th>Details</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0
                            ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-state__icon">📜</div>No log entries</div></td></tr>
                            : items.map((l: any) => (
                                <tr key={l.id}>
                                    <td className="mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                                        {new Date(l.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{l.username || '—'}</td>
                                    <td>
                        <span className={`badge ${ACTION_BADGE[l.action] || 'badge-info'}`} style={{ fontSize: 10 }}>
                          {l.action}
                        </span>
                                    </td>
                                    <td style={{ fontSize: 12, color: 'var(--muted)' }}>
                                        {l.entityType && <span className="badge badge-closed" style={{ marginRight: 4, fontSize: 10 }}>{l.entityType}</span>}
                                        {l.entityId && <span className="mono" style={{ fontSize: 10 }}>{l.entityId?.slice(0, 8)}</span>}
                                    </td>
                                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted2)' }}>{l.ipAddress || '—'}</td>
                                    <td style={{ fontSize: 11, color: 'var(--muted)', maxWidth: 200 }}>
                                        {l.details ? JSON.stringify(l.details) : '—'}
                                    </td>
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