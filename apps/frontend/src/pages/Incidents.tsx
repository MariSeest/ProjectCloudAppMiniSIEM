import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentsApi } from '../api'
import { SeverityBadge, StatusBadge } from '../components/shared'
import { useAuth } from '../auth/AuthContext'

function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{d.value}</span>
                    <div style={{ width: '100%', height: (d.value / max) * 60 + 4, background: color, borderRadius: '3px 3px 0 0', minHeight: 4, transition: 'height 0.4s ease' }} />
                    <span style={{ fontSize: 10, color: 'var(--muted2)', textAlign: 'center' }}>{d.label}</span>
                </div>
            ))}
        </div>
    )
}

function DonutChart({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
    const pct = max > 0 ? value / max : 0
    const r = 28
    const circ = 2 * Math.PI * r
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
                        strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
                        transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill="var(--text)">{value}</text>
            </svg>
            <span style={{ fontSize: 11, color: 'var(--muted2)', textAlign: 'center' }}>{label}</span>
        </div>
    )
}

interface KpiDetail {
    title: string
    color: string
    incidents: any[]
}

function KpiDetailModal({ detail, onClose, onOpen }: { detail: KpiDetail; onClose: () => void; onOpen: (id: string) => void }) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" style={{ maxWidth: 700, width: '90%' }} onClick={e => e.stopPropagation()}>
                <div className="modal-header" style={{ borderBottom: `3px solid ${detail.color}`, paddingBottom: 12, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 className="modal-title" style={{ color: detail.color }}>{detail.title}</h3>
                            <span style={{ fontSize: 13, color: 'var(--muted2)' }}>{detail.incidents.length} incidenti</span>
                        </div>
                        <button className="modal-close" onClick={onClose}>✕</button>
                    </div>
                </div>
                <div style={{ maxHeight: 460, overflowY: 'auto' }}>
                    {detail.incidents.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state__icon">🚨</div>
                            Nessun incidente in questa categoria
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Titolo</th>
                                <th style={{ width: 100 }}>Severità</th>
                                <th style={{ width: 110 }}>Stato</th>
                                <th style={{ width: 150 }}>Creato</th>
                                <th style={{ width: 80 }}>Azioni</th>
                            </tr>
                            </thead>
                            <tbody>
                            {detail.incidents.map((inc: any) => (
                                <tr key={inc.id}>
                                    <td>
                                        <div style={{ fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</div>
                                        <div style={{ fontSize: 10, color: 'var(--muted2)', fontFamily: 'monospace' }}>#{inc.id?.slice(0, 8)}</div>
                                    </td>
                                    <td><SeverityBadge severity={inc.severity} /></td>
                                    <td><StatusBadge status={inc.status} /></td>
                                    <td style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'monospace' }}>
                                        {new Date(inc.createdAt).toLocaleString()}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-xs btn-primary"
                                            onClick={() => { onOpen(inc.id); onClose() }}
                                        >
                                            Apri
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Incidents() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [filterStatus, setFilterStatus] = useState('ALL')
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [showTakeCharge, setShowTakeCharge] = useState<any>(null)
    const [duration, setDuration] = useState('')
    const [showAnalytics, setShowAnalytics] = useState(true)
    const [kpiDetail, setKpiDetail] = useState<KpiDetail | null>(null)
    const [form, setForm] = useState({ title: '', description: '', severity: 'HIGH', cveIds: '' })

    async function load() {
        setLoading(true); setError('')
        try { setItems(await incidentsApi.list()) }
        catch (e: any) { setError(String(e)) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    const filtered = useMemo(() => {
        let r = [...items].sort((a, b) => a.createdAt < b.createdAt ? 1 : -1)
        if (filterStatus !== 'ALL') r = r.filter(i => i.status === filterStatus)
        if (search) r = r.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()))
        return r
    }, [items, filterStatus, search])

    const analytics = useMemo(() => {
        const bySeverity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => ({
            label: s, value: items.filter(i => i.severity === s).length
        }))
        const withCve = items.filter(i => i.cveIds?.length > 0).length
        const takenCharge = items.filter(i => i.takenChargeAt).length
        const avgDuration = items.filter(i => i.takenChargeDurationMinutes)
            .reduce((acc, i, _, arr) => acc + i.takenChargeDurationMinutes / arr.length, 0)
        const now = Date.now()
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now - (6 - i) * 86400000)
            return {
                label: d.toLocaleDateString('it', { weekday: 'short' }),
                value: items.filter(inc => new Date(inc.createdAt).toDateString() === d.toDateString()).length
            }
        })
        return { bySeverity, withCve, takenCharge, avgDuration, days }
    }, [items])

    const kpiCards = [
        {
            label: 'Totale',
            value: items.length,
            color: '#378ADD',
            incidents: items,
            title: 'Tutti gli Incidenti',
        },
        {
            label: 'Aperti',
            value: items.filter(i => i.status === 'OPEN').length,
            color: '#E24B4A',
            incidents: items.filter(i => i.status === 'OPEN'),
            title: 'Incidenti Aperti',
        },
        {
            label: 'In Progress',
            value: items.filter(i => i.status === 'IN_PROGRESS').length,
            color: '#EF9F27',
            incidents: items.filter(i => i.status === 'IN_PROGRESS'),
            title: 'Incidenti In Progress',
        },
        {
            label: 'Risolti',
            value: items.filter(i => i.status === 'RESOLVED').length,
            color: '#639922',
            incidents: items.filter(i => i.status === 'RESOLVED'),
            title: 'Incidenti Risolti',
        },
        {
            label: 'Critici',
            value: items.filter(i => i.severity === 'CRITICAL').length,
            color: '#A32D2D',
            incidents: items.filter(i => i.severity === 'CRITICAL'),
            title: 'Incidenti Critici',
        },
    ]

    async function onCreate() {
        if (!form.title.trim()) return
        setLoading(true)
        try {
            const cveIds = form.cveIds.split(',').map(s => s.trim()).filter(Boolean)
            await incidentsApi.create({ ...form, cveIds })
            setForm({ title: '', description: '', severity: 'HIGH', cveIds: '' })
            setShowModal(false)
            setSuccess('Incident created.')
            await load()
        } catch (e: any) { setError(String(e)) }
        finally { setLoading(false) }
    }

    async function onArchive(id: string, e: React.MouseEvent) {
        e.stopPropagation()
        if (!confirm('Archive this incident?')) return
        try { await incidentsApi.archive(id); setSuccess('Archived.'); await load() }
        catch (e: any) { setError(String(e)) }
    }

    async function onTakeCharge() {
        if (!showTakeCharge) return
        try {
            await incidentsApi.takeCharge(showTakeCharge.id, { durationMinutes: duration ? parseInt(duration) : null })
            setShowTakeCharge(null); setDuration('')
            setSuccess('Taken charge.'); await load()
        } catch (e: any) { setError(String(e)) }
    }

    const canEdit = user?.role === 'ADMIN' || user?.role === 'ANALYST'

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Incidents</h1>
                    <p className="page-subtitle">Track, investigate and correlate security incidents</p>
                </div>
                <div className="page-actions">
                    <button className="btn" onClick={() => setShowAnalytics(p => !p)}>
                        {showAnalytics ? '📊 Nascondi Analytics' : '📊 Mostra Analytics'}
                    </button>
                    {canEdit && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Incident</button>}
                    <button className="btn" onClick={() => navigate('/correlate')}>⬡ Workspace</button>
                    <button className="btn" onClick={() => navigate('/tickets/archived')}>🗃️ Archived</button>
                    <button className="btn btn-sm" onClick={load} disabled={loading}>↻</button>
                </div>
            </div>

            {error && <div className="alert-msg alert-msg--error">{error}</div>}
            {success && <div className="alert-msg alert-msg--success">{success}</div>}

            {showAnalytics && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>

                    {/* KPI cards cliccabili */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                        {kpiCards.map((s, i) => (
                            <div
                                key={i}
                                className="card"
                                style={{
                                    padding: '14px 16px',
                                    borderTop: `3px solid ${s.color}`,
                                    cursor: 'pointer',
                                    transition: 'transform 0.15s',
                                }}
                                onClick={() => setKpiDetail({ title: s.title, color: s.color, incidents: s.incidents })}
                                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-3px)')}
                                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{s.label}</div>
                                <div style={{ fontSize: 10, color: s.color, marginTop: 6, opacity: 0.7 }}>
                                    clicca per dettagli →
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grafici */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500, marginBottom: 12 }}>TREND ULTIMI 7 GIORNI</div>
                            <BarChart data={analytics.days} color="#378ADD" />
                        </div>
                        <div className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500, marginBottom: 12 }}>PER SEVERITÀ</div>
                            <BarChart data={analytics.bySeverity} color="#EF9F27" />
                        </div>
                        <div className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 500, marginBottom: 12 }}>STATO INCIDENTI</div>
                            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                                <DonutChart value={items.filter(i => i.status === 'OPEN').length} max={items.length} color="#E24B4A" label="Aperti" />
                                <DonutChart value={items.filter(i => i.status === 'IN_PROGRESS').length} max={items.length} color="#EF9F27" label="In corso" />
                                <DonutChart value={items.filter(i => i.status === 'RESOLVED').length} max={items.length} color="#639922" label="Risolti" />
                            </div>
                        </div>
                    </div>

                    {/* Info aggiuntive */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>🔗</span>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{analytics.withCve}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Incidenti con CVE correlate</div>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>👤</span>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{analytics.takenCharge}</div>
                                <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Incidenti presi in carico</div>
                            </div>
                        </div>
                        <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: 24 }}>⏱️</span>
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                                    {analytics.avgDuration > 0 ? `${Math.round(analytics.avgDuration)} min` : '—'}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Tempo medio presa in carico</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="filters">
                <input className="input" style={{ width: 260 }} placeholder="🔍 Search incidents…" value={search} onChange={e => setSearch(e.target.value)} />
                {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => (
                    <button key={s} className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : ''}`} onClick={() => setFilterStatus(s)}>{s}</button>
                ))}
            </div>

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Active Incidents</span>
                    <span className="card-count">{filtered.length} shown</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th style={{ width: 100 }}>Severity</th>
                            <th style={{ width: 110 }}>Status</th>
                            <th>CVEs</th>
                            <th style={{ width: 90 }}>Corr.</th>
                            <th style={{ width: 150 }}>Created</th>
                            <th style={{ width: 180 }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.length === 0
                            ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-state__icon">🚨</div>No incidents found</div></td></tr>
                            : filtered.map((i: any) => (
                                <tr key={i.id} className="clickable-row" onClick={() => navigate(`/incidents/${i.id}`)}>
                                    <td>
                                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{i.title}</div>
                                        <div className="mono" style={{ fontSize: 10, color: 'var(--muted2)', marginTop: 2 }}>#{i.id?.slice(0, 8)}</div>
                                    </td>
                                    <td><SeverityBadge severity={i.severity} /></td>
                                    <td><StatusBadge status={i.status} /></td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                            {(i.cveIds || []).slice(0, 2).map((c: string) => <span key={c} className="tag">{c}</span>)}
                                            {(i.cveIds || []).length > 2 && <span className="tag">+{i.cveIds.length - 2}</span>}
                                            {!i.cveIds?.length && <span style={{ color: 'var(--muted2)' }}>—</span>}
                                        </div>
                                    </td>
                                    <td>
                                        {i.correlations?.length > 0
                                            ? <span className="badge badge-info">🔗 {i.correlations.length}</span>
                                            : <span style={{ color: 'var(--muted2)' }}>—</span>}
                                    </td>
                                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                        {new Date(i.createdAt).toLocaleString()}
                                    </td>
                                    <td onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                            <button className="btn btn-xs" onClick={() => navigate(`/incidents/${i.id}`)}>Open</button>
                                            {canEdit && !i.takenChargeAt && (
                                                <button className="btn btn-xs btn-primary" onClick={() => setShowTakeCharge(i)}>Take Charge</button>
                                            )}
                                            {canEdit && (
                                                <button className="btn btn-xs btn-danger" onClick={e => onArchive(i.id, e)}>Archive</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                }
            </div>

            {/* Modal dettaglio KPI */}
            {kpiDetail && (
                <KpiDetailModal
                    detail={kpiDetail}
                    onClose={() => setKpiDetail(null)}
                    onOpen={(id) => navigate(`/incidents/${id}`)}
                />
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">New Incident</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                            <div className="form-grid">
                                <div className="field">
                                    <label className="field-label">Title *</label>
                                    <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Suspicious Vulnerability Detected" />
                                </div>
                                <div className="field">
                                    <label className="field-label">Severity</label>
                                    <select className="select" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                                        {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="field">
                                <label className="field-label">Description</label>
                                <textarea className="textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Investigate exposure..." />
                            </div>
                            <div className="field">
                                <label className="field-label">CVE IDs (comma separated)</label>
                                <input className="input" value={form.cveIds} onChange={e => setForm(p => ({ ...p, cveIds: e.target.value }))} placeholder="CVE-2024-39174, CVE-2022-1234" />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={onCreate} disabled={loading || !form.title.trim()}>Create Incident</button>
                        </div>
                    </div>
                </div>
            )}

            {showTakeCharge && (
                <div className="modal-overlay" onClick={() => setShowTakeCharge(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Take Charge</h3>
                        <p className="modal-sub">Taking charge of: <strong>{showTakeCharge.title}</strong></p>
                        <div className="field">
                            <label className="field-label">Time to take charge (minutes)</label>
                            <input className="input" type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 15" />
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowTakeCharge(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={onTakeCharge}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}