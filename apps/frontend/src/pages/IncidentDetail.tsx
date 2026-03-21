import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { incidentsApi, eventsApi } from '../api'
import { SeverityBadge, StatusBadge, CommentSection } from '../components/shared'
import { useAuth } from '../auth/AuthContext'

export default function IncidentDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [incident, setIncident] = useState<any>(null)
    const [allIncidents, setAllIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [form, setForm] = useState<any>({})
    const [corrModal, setCorrModal] = useState(false)
    const [corrTarget, setCorrTarget] = useState('')
    const [corrType, setCorrType] = useState('same attack vector')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    async function load() {
        try {
            const [inc, all] = await Promise.all([incidentsApi.get(id!), incidentsApi.list()])
            setIncident(inc)
            setForm({
                title: inc.title, severity: inc.severity, status: inc.status,
                description: inc.description || '', cveIds: (inc.cveIds || []).join(', ')
            })
            setAllIncidents(all.filter((i: any) => i.id !== id))
        } finally { setLoading(false) }
    }

    useEffect(() => { load() }, [id])

    async function saveEdit() {
        try {
            const updated = await incidentsApi.update(id!, {
                ...form, cveIds: form.cveIds.split(',').map((s: string) => s.trim()).filter(Boolean)
            })
            setIncident(updated); setEditMode(false); setSuccess('Saved.')
        } catch (e: any) { setError(String(e)) }
    }

    async function addCorrelation() {
        if (!corrTarget) return
        try {
            await incidentsApi.correlate({ incidentId1: id, incidentId2: corrTarget, correlationType: corrType })
            setCorrModal(false); setCorrTarget(''); setSuccess('Correlation saved to DB.')
            await load()
        } catch (e: any) { setError(String(e)) }
    }

    async function removeCorrelation(corrId: string) {
        try { await incidentsApi.deleteCorrelation(corrId); await load() }
        catch (e: any) { setError(String(e)) }
    }

    const canEdit = user?.role === 'ADMIN' || user?.role === 'ANALYST'

    if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
    if (!incident) return <div className="empty-state"><div className="empty-state__icon">❌</div>Incident not found</div>

    return (
        <div className="page">
            <div className="breadcrumb">
                <button className="btn btn-sm" onClick={() => navigate('/incidents')}>← Incidents</button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">#{incident.id?.slice(0, 8)} · {incident.title}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--text)', wordBreak: 'break-word', maxWidth: '100%' }}>
                        {incident.title}
                    </h1>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <SeverityBadge severity={incident.severity} />
                        <StatusBadge status={incident.status} />
                        <span className="mono" style={{ fontSize: 11, color: 'var(--muted2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>
              #{incident.id}
            </span>
                    </div>
                </div>
                <div className="page-actions">
                    {canEdit && !editMode && <button className="btn btn-sm btn-primary" onClick={() => setEditMode(true)}>✏️ Edit</button>}
                    {canEdit && editMode && (
                        <>
                            <button className="btn btn-sm btn-primary" onClick={saveEdit}>💾 Save</button>
                            <button className="btn btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                        </>
                    )}
                    <button className="btn btn-sm" onClick={() => navigate('/correlate')}>⬡ Workspace</button>
                </div>
            </div>

            {error && <div className="alert-msg alert-msg--error">{error}</div>}
            {success && <div className="alert-msg alert-msg--success">{success}</div>}

            <div className="detail-grid">
                <div className="detail-col">
                    {editMode ? (
                        <div className="card">
                            <div className="card-head"><span className="card-title">Edit Incident</span></div>
                            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <div className="form-grid">
                                    <div className="field">
                                        <label className="field-label">Title</label>
                                        <input className="input" value={form.title} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Severity</label>
                                        <select className="select" value={form.severity} onChange={e => setForm((p: any) => ({ ...p, severity: e.target.value }))}>
                                            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="field">
                                        <label className="field-label">Status</label>
                                        <select className="select" value={form.status} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                                            {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="field">
                                        <label className="field-label">CVE IDs</label>
                                        <input className="input" value={form.cveIds} onChange={e => setForm((p: any) => ({ ...p, cveIds: e.target.value }))} placeholder="CVE-2024-1234" />
                                    </div>
                                </div>
                                <div className="field">
                                    <label className="field-label">Description</label>
                                    <textarea className="textarea" rows={4} value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="card">
                                <div className="card-head"><span className="card-title">Description</span></div>
                                <div className="card-body" style={{ fontSize: 14, lineHeight: 1.7, minHeight: 60 }}>
                                    {incident.description || <span style={{ color: 'var(--muted2)' }}>No description provided.</span>}
                                </div>
                            </div>
                            <div className="card">
                                <div className="card-head">
                                    <span className="card-title">CVE References</span>
                                    <span className="card-count">{(incident.cveIds || []).length}</span>
                                </div>
                                <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {(incident.cveIds || []).length > 0
                                        ? (incident.cveIds || []).map((c: string) => (
                                            <a key={c} className="tag"
                                               href={`https://nvd.nist.gov/vuln/detail/${c}`}
                                               target="_blank" rel="noreferrer"
                                               style={{ cursor: 'pointer' }}>
                                                🔍 {c}
                                            </a>
                                        ))
                                        : <span style={{ color: 'var(--muted2)', fontSize: 13 }}>No CVEs linked.</span>
                                    }
                                </div>
                            </div>
                        </>
                    )}

                    <CommentSection
                        getComments={() => eventsApi.getComments(id!).catch(() => [])}
                        addComment={(c) => eventsApi.addComment(id!, c)}
                    />
                </div>

                <div className="detail-col">
                    <div className="card">
                        <div className="card-head">
                            <span className="card-title">🔗 Correlations</span>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <span className="card-count">{(incident.correlations || []).length}</span>
                                {canEdit && (
                                    <button className="btn btn-xs btn-primary" onClick={() => setCorrModal(true)}>+ Add</button>
                                )}
                            </div>
                        </div>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {(incident.correlations || []).length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--muted2)', fontSize: 13 }}>
                                    No correlations.<br />
                                    <button className="btn btn-sm btn-primary" style={{ marginTop: 10 }} onClick={() => navigate('/correlate')}>
                                        Open Workspace →
                                    </button>
                                </div>
                            ) : (incident.correlations || []).map((c: any) => {
                                const isFrom = c.incidentId1 === id
                                const otherId = isFrom ? c.incidentId2 : c.incidentId1
                                const otherTitle = isFrom ? c.incidentTitle2 : c.incidentTitle1
                                return (
                                    <div key={c.id} style={{ background: 'rgba(58,169,255,0.06)', border: '1px solid rgba(58,169,255,0.18)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <span style={{ fontSize: 16, flexShrink: 0 }}>🔗</span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted2)', marginBottom: 3 }}>
                                                {c.correlationType}
                                            </div>
                                            <Link to={`/incidents/${otherId}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {otherTitle || `#${otherId?.slice(0, 8)}`}
                                            </Link>
                                            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>
                                                by {c.createdByName || 'system'} · {new Date(c.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        {canEdit && (
                                            <button onClick={() => removeCorrelation(c.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, opacity: 0.6, flexShrink: 0 }}>✕</button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-head"><span className="card-title">Incident Info</span></div>
                        <div className="card-body">
                            <div className="info-rows">
                                {[
                                    ['Status', <StatusBadge status={incident.status} />],
                                    ['Severity', <SeverityBadge severity={incident.severity} />],
                                    ['Created', new Date(incident.createdAt).toLocaleString()],
                                    ['Updated', new Date(incident.updatedAt).toLocaleString()],
                                    incident.takenChargeAt && ['Taken Charge', new Date(incident.takenChargeAt).toLocaleString()],
                                    incident.takenChargeByName && ['By', incident.takenChargeByName],
                                    incident.takenChargeDurationMinutes && ['Duration', `${incident.takenChargeDurationMinutes} min`],
                                ].filter(Boolean).map(([l, v]: any) => (
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

            {corrModal && (
                <div className="modal-overlay" onClick={() => setCorrModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Add Correlation</h3>
                        <p className="modal-sub">Correlate <strong>{incident.title}</strong> with another incident. Saved to DB.</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div className="field">
                                <label className="field-label">Target Incident</label>
                                <select className="select" value={corrTarget} onChange={e => setCorrTarget(e.target.value)}>
                                    <option value="">Select incident…</option>
                                    {allIncidents.map((i: any) => (
                                        <option key={i.id} value={i.id}>{i.title} ({i.severity})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label className="field-label">Correlation Type</label>
                                <input className="input" value={corrType} onChange={e => setCorrType(e.target.value)} placeholder="same attack vector" />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setCorrModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={addCorrelation} disabled={!corrTarget}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}