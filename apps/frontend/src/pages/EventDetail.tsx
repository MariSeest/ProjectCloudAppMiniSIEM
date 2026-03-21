import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi } from '../api'
import { NumericSeverityBadge, CommentSection } from '../components/shared'

export function EventDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [event, setEvent] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        eventsApi.get(id!).then(setEvent).catch(() => {}).finally(() => setLoading(false))
    }, [id])

    if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
    if (!event) return <div className="empty-state"><div className="empty-state__icon">❌</div>Event not found</div>

    return (
        <div className="page">
            <div className="breadcrumb">
                <button className="btn btn-sm" onClick={() => navigate('/events')}>← Events</button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{event.title}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, wordBreak: 'break-word' }}>{event.title}</h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <NumericSeverityBadge severity={Number(event.severity) || 0} />
                        <span className="badge badge-info">{event.source}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{new Date(event.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="detail-grid">
                <div className="detail-col">
                    <div className="card">
                        <div className="card-head"><span className="card-title">Description</span></div>
                        <div className="card-body" style={{ fontSize: 14, lineHeight: 1.7 }}>
                            {event.description || <span style={{ color: 'var(--muted2)' }}>No description.</span>}
                        </div>
                    </div>
                    <CommentSection
                        getComments={() => eventsApi.getComments(id!)}
                        addComment={(c) => eventsApi.addComment(id!, c)}
                    />
                </div>

                <div className="detail-col">
                    <div className="card">
                        <div className="card-head"><span className="card-title">Event Info</span></div>
                        <div className="card-body">
                            <div className="info-rows">
                                {[
                                    ['ID', <span className="mono">{event.id?.slice(0, 8)}…</span>],
                                    ['Source', event.source],
                                    ['Severity', <NumericSeverityBadge severity={Number(event.severity) || 0} />],
                                    ['Timestamp', new Date(event.timestamp).toLocaleString()],
                                    ['Ingested', new Date(event.createdAt).toLocaleString()],
                                ].map(([l, v]: any) => (
                                    <div key={l} className="info-row">
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