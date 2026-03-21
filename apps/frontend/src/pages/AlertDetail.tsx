import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { alertsApi } from '../api'
import { SeverityBadge, StatusBadge, CommentSection } from '../components/shared'

export function AlertDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [alert, setAlert] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        alertsApi.get(id!).then(setAlert).catch(() => {}).finally(() => setLoading(false))
    }, [id])

    async function updateStatus(status: string) {
        const updated = await alertsApi.updateStatus(id!, status)
        setAlert(updated)
    }

    if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
    if (!alert) return <div className="empty-state"><div className="empty-state__icon">❌</div>Alert not found</div>

    return (
        <div className="page">
            <div className="breadcrumb">
                <button className="btn btn-sm" onClick={() => navigate('/alerts')}>← Alerts</button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{alert.title}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, wordBreak: 'break-word' }}>
                        {alert.title}
                    </h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <SeverityBadge severity={alert.severity} />
                        <StatusBadge status={alert.status} />
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>
              {new Date(alert.createdAt).toLocaleString()}
            </span>
                    </div>
                </div>
                <div className="page-actions">
                    {alert.status !== 'RESOLVED' && (
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus('RESOLVED')}>
                            ✓ Resolve
                        </button>
                    )}
                    {alert.status === 'OPEN' && (
                        <button className="btn btn-sm" onClick={() => updateStatus('ACK')}>
                            👁 Acknowledge
                        </button>
                    )}
                </div>
            </div>

            <div className="detail-grid">
                <div className="detail-col">
                    <div className="card">
                        <div className="card-head"><span className="card-title">Description</span></div>
                        <div className="card-body" style={{ fontSize: 14, lineHeight: 1.7 }}>
                            {alert.description || <span style={{ color: 'var(--muted2)' }}>No description.</span>}
                        </div>
                    </div>
                    <CommentSection
                        getComments={() => alertsApi.getComments(id!)}
                        addComment={(c: string) => alertsApi.addComment(id!, c)}
                    />
                </div>

                <div className="detail-col">
                    <div className="card">
                        <div className="card-head"><span className="card-title">Alert Info</span></div>
                        <div className="card-body">
                            <div className="info-rows">
                                {([
                                    ['ID', <span className="mono">{alert.id?.slice(0, 8)}…</span>],
                                    ['Source', alert.source],
                                    ['Severity', <SeverityBadge severity={alert.severity} />],
                                    ['Status', <StatusBadge status={alert.status} />],
                                    ['Created', new Date(alert.createdAt).toLocaleString()],
                                    alert.resolvedAt ? ['Resolved', new Date(alert.resolvedAt).toLocaleString()] : null,
                                ] as Array<[string, React.ReactNode] | null>)
                                    .filter(Boolean)
                                    .map(([l, v]) => (
                                        <div key={String(l)} className="info-row">
                                            <span className="info-label">{l}</span>
                                            <span className="info-value">{v}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}