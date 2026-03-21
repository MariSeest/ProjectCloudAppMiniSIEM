import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { falxdrApi } from '../api'

export function FalxdrEndpoints() {
    const navigate = useNavigate()
    const [endpoints, setEndpoints] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        falxdrApi.endpoints().then(setEndpoints).catch(() => setEndpoints([])).finally(() => setLoading(false))
    }, [])

    function statusDot(s: string) {
        const cls = s === 'ACTIVE' ? 'endpoint-status--active' : s === 'STALE' ? 'endpoint-status--stale' : 'endpoint-status--offline'
        return <span className={`endpoint-status ${cls}`} />
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">FALXDR Endpoints</h1>
                    <p className="page-subtitle">Endpoints protected by FALXDR agent — click for details</p>
                </div>
                <div className="page-actions">
                    <button className="btn" onClick={() => navigate('/discovery')}>📡 Discover New Assets</button>
                    <button className="btn btn-sm" onClick={() => { setLoading(true); falxdrApi.endpoints().then(setEndpoints).finally(() => setLoading(false)) }}>↻</button>
                </div>
            </div>

            {loading
                ? <div className="loading-wrap"><div className="spinner" /></div>
                : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                        {endpoints.length === 0
                            ? <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="empty-state__icon">🛡️</div>No endpoints found</div>
                            : endpoints.map((ep: any) => (
                                <div key={ep.id} className="endpoint-card" onClick={() => navigate(`/falxdr/${ep.id}`)}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                        {statusDot(ep.agentStatus)}
                                        <span style={{ fontWeight: 700, fontSize: 15 }}>{ep.hostname}</span>
                                        <span className={`badge ${ep.agentStatus === 'ACTIVE' ? 'badge-resolved' : ep.agentStatus === 'STALE' ? 'badge-medium' : 'badge-critical'}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
                      {ep.agentStatus}
                    </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                                        {[
                                            ['IP', ep.ipAddress],
                                            ['OS', `${ep.os || ''} ${ep.osVersion || ''}`],
                                            ['CPU', ep.cpu],
                                            ['RAM', ep.ramGb ? `${ep.ramGb} GB` : '—'],
                                            ['Disk', ep.diskGb ? `${ep.diskGb} GB` : '—'],
                                            ['Agent', ep.agentVersion],
                                            ['Last seen', ep.lastSeen ? new Date(ep.lastSeen).toLocaleString() : '—'],
                                        ].map(([l, v]) => (
                                            <div key={l} style={{ fontSize: 11 }}>
                                                <span style={{ color: 'var(--muted2)' }}>{l}: </span>
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}