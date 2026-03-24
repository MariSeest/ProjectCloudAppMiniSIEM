import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { falxdrApi } from '../api'

const STORAGE_KEY = 'minisiem_installed_agents'
const VIRTUAL_KEY = 'minisiem_virtual_agents'

function getVirtualAgents(): any[] {
    try { return JSON.parse(localStorage.getItem(VIRTUAL_KEY) || '[]') } catch { return [] }
}

export function FalxdrEndpoints() {
    const navigate = useNavigate()
    const [endpoints, setEndpoints] = useState<any[]>([])
    const [virtualAgents, setVirtualAgents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')

    async function load() {
        setLoading(true)
        try {
            const real = await falxdrApi.endpoints().catch(() => [])
            setEndpoints(real)
            setVirtualAgents(getVirtualAgents())
        } finally { setLoading(false) }
    }

    useEffect(() => { void load() }, [])

    async function uninstallAgent(hostname: string) {
        if (!confirm(`Uninstall FALXDR agent from ${hostname}? The asset will return to Asset Discovery.`)) return
        const installed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
        const newInstalled = installed.filter((h: string) => h !== hostname)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newInstalled))
        const virtuals = getVirtualAgents().filter((a: any) => a.hostname !== hostname)
        localStorage.setItem(VIRTUAL_KEY, JSON.stringify(virtuals))
        setVirtualAgents(virtuals)
        setMsg(`✅ Agent uninstalled from ${hostname}. Asset returned to Asset Discovery.`)
    }

    function statusDot(s: string) {
        const cls = s === 'ACTIVE' ? 'endpoint-status--active' : s === 'STALE' ? 'endpoint-status--stale' : 'endpoint-status--offline'
        return <span className={`endpoint-status ${cls}`} />
    }

    const allEndpoints = [
        ...endpoints,
        ...virtualAgents.filter(v => !endpoints.find((e: any) => e.hostname === v.hostname))
    ]

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">FALXDR Endpoints</h1>
                    <p className="page-subtitle">Endpoints protected by FALXDR agent — click for details</p>
                </div>
                <div className="page-actions">
                    <button className="btn" onClick={() => navigate('/discovery')}>📡 Discover New Assets</button>
                    <button className="btn btn-sm" onClick={load} disabled={loading}>↻</button>
                </div>
            </div>

            {msg && <div className="alert-msg alert-msg--success">{msg}</div>}

            {loading
                ? <div className="loading-wrap"><div className="spinner" /></div>
                : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                        {allEndpoints.length === 0
                            ? <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                                <div className="empty-state__icon">🛡️</div>
                                No endpoints found.
                                <br />
                                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/discovery')}>
                                    📡 Discover Assets
                                </button>
                            </div>
                            : allEndpoints.map((ep: any) => (
                                <div key={ep.id || ep.hostname} className="endpoint-card" style={{ position: 'relative' }}>
                                    <div
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => !ep.isVirtual && navigate(`/falxdr/${ep.id}`)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                            {statusDot(ep.agentStatus)}
                                            <span style={{ fontWeight: 700, fontSize: 15 }}>{ep.hostname}</span>
                                            <span className={`badge ${ep.agentStatus === 'ACTIVE' ? 'badge-resolved' : ep.agentStatus === 'STALE' ? 'badge-medium' : 'badge-critical'}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
                                                {ep.agentStatus}
                                            </span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 12 }}>
                                            {[
                                                ['IP', ep.ipAddress],
                                                ['OS', `${ep.os || ''} ${ep.osVersion || ''}`.trim() || '—'],
                                                ['CPU', ep.cpu || '—'],
                                                ['RAM', ep.ramGb ? `${ep.ramGb} GB` : '—'],
                                                ['Agent', ep.agentVersion || '1.2.3'],
                                                ['Last seen', ep.lastSeen ? new Date(ep.lastSeen).toLocaleString() : '—'],
                                            ].map(([l, v]) => (
                                                <div key={l} style={{ fontSize: 11 }}>
                                                    <span style={{ color: 'var(--muted2)' }}>{l}: </span>
                                                    <span>{v || '—'}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {ep.isVirtual && (
                                            <div style={{ fontSize: 11, color: 'var(--muted2)', marginBottom: 8 }}>
                                                📡 Virtually installed via Asset Discovery
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        className="btn btn-xs btn-danger"
                                        style={{ width: '100%' }}
                                        onClick={() => void uninstallAgent(ep.hostname)}
                                    >
                                        🗑️ Uninstall Agent
                                    </button>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}