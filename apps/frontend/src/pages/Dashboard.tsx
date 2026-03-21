import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardApi } from '../api'

interface Stats {
    totalEvents: number; totalAlerts: number; openAlerts: number
    openIncidents: number; criticalIncidents: number; totalEndpoints: number; activeEndpoints: number
}

export default function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        dashboardApi.stats()
            .then(setStats)
            .catch(() => setStats({ totalEvents: 0, totalAlerts: 0, openAlerts: 0, openIncidents: 0, criticalIncidents: 0, totalEndpoints: 0, activeEndpoints: 0 }))
            .finally(() => setLoading(false))
    }, [])

    const CARDS = [
        { icon: '⚡', label: 'Total Events', key: 'totalEvents', sub: 'Ingested events', to: '/events' },
        { icon: '🔔', label: 'Open Alerts', key: 'openAlerts', sub: 'Require triage', to: '/alerts', danger: true },
        { icon: '🚨', label: 'Open Incidents', key: 'openIncidents', sub: 'Active investigations', to: '/incidents', danger: true },
        { icon: '☠️', label: 'Critical Incidents', key: 'criticalIncidents', sub: 'Immediate action needed', to: '/incidents', danger: true },
        { icon: '🛡️', label: 'Endpoints', key: 'totalEndpoints', sub: 'FALXDR protected', to: '/falxdr' },
        { icon: '✅', label: 'Active Agents', key: 'activeEndpoints', sub: 'Online endpoints', to: '/falxdr' },
    ]

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Real-time security operations overview</p>
                </div>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/incidents')}>+ New Incident</button>
                    <button className="btn" onClick={() => navigate('/acn')}>📋 ACN Report</button>
                </div>
            </div>

            {loading
                ? <div className="loading-wrap"><div className="spinner" /></div>
                : <div className="stat-grid">
                    {CARDS.map(c => (
                        <div key={c.key} className="stat-card" onClick={() => navigate(c.to)}>
                            <div className="stat-card__icon">{c.icon}</div>
                            <div className="stat-card__label">{c.label}</div>
                            <div className="stat-card__value"
                                 style={c.danger && (stats as any)?.[c.key] > 0 ? { background: 'linear-gradient(90deg,var(--danger),var(--warning))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}}>
                                {(stats as any)?.[c.key] ?? 0}
                            </div>
                            <div className="stat-card__sub">{c.sub}</div>
                        </div>
                    ))}
                </div>
            }

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card">
                    <div className="card-head"><span className="card-title">Quick Actions</span></div>
                    <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            ['⚡ View Events', '/events'],
                            ['🔔 Triage Alerts', '/alerts'],
                            ['🚨 Manage Incidents', '/incidents'],
                            ['⬡ Correlation Workspace', '/correlate'],
                            ['📋 Submit ACN Report', '/acn'],
                            ['🛡️ FALXDR Console', '/falxdr'],
                            ['🔑 Identity Management', '/identity'],
                        ].map(([label, path]) => (
                            <button key={path} className="btn" style={{ justifyContent: 'flex-start' }} onClick={() => navigate(path as string)}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-head"><span className="card-title">Platform Status</span></div>
                    <div className="card-body">
                        {[
                            ['Event Ingestion', 'ACTIVE', true],
                            ['Alert Engine', 'ACTIVE', true],
                            ['Correlation Engine', 'ACTIVE', true],
                            ['FALXDR Agent', 'ACTIVE', true],
                            ['ACN Gateway', 'STANDBY', false],
                            ['Threat Intel Feed', 'ACTIVE', true],
                        ].map(([svc, status, ok]) => (
                            <div key={svc as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(128,128,128,0.08)' }}>
                                <span style={{ fontSize: 13 }}>{svc}</span>
                                <span className={`badge ${ok ? 'badge-resolved' : 'badge-open'}`}>{status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}