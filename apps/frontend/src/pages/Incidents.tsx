import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentsApi } from '../api'
import { SeverityBadge, StatusBadge } from '../components/shared'
import { useAuth } from '../auth/AuthContext'

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
                    {canEdit && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Incident</button>}
                    <button className="btn" onClick={() => navigate('/correlate')}>⬡ Workspace</button>
                    <button className="btn" onClick={() => navigate('/tickets/archived')}>🗃️ Archived</button>
                    <button className="btn btn-sm" onClick={load} disabled={loading}>↻</button>
                </div>
            </div>

            {error && <div className="alert-msg alert-msg--error">{error}</div>}
            {success && <div className="alert-msg alert-msg--success">{success}</div>}

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