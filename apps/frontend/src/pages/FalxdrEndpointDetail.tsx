import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { falxdrApi } from '../api'

export function FalxdrEndpointDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [detail, setDetail] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('general')
    const [appName, setAppName] = useState('')
    const [msg, setMsg] = useState('')

    async function load() {
        falxdrApi.endpointDetail(id!).then(setDetail).finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [id])

    async function installApp() {
        if (!appName.trim()) return
        await falxdrApi.installApp(id!, appName)
        setMsg(`Installing ${appName}…`)
        setAppName('')
        setDetail(await falxdrApi.endpointDetail(id!))
    }

    async function removeApp(appId: string, name: string) {
        if (!confirm(`Remove ${name}?`)) return
        await falxdrApi.removeApp(id!, appId)
        setDetail(await falxdrApi.endpointDetail(id!))
    }

    if (loading) return <div className="loading-wrap"><div className="spinner" /></div>
    if (!detail) return <div className="empty-state"><div className="empty-state__icon">❌</div>Endpoint not found</div>

    const ep = detail.endpoint

    return (
        <div className="page">
            <div className="breadcrumb">
                <button className="btn btn-sm" onClick={() => navigate('/falxdr')}>← FALXDR</button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{ep.hostname}</span>
            </div>

            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{ep.hostname}</h1>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <span className={`badge ${ep.agentStatus === 'ACTIVE' ? 'badge-resolved' : ep.agentStatus === 'STALE' ? 'badge-medium' : 'badge-critical'}`}>{ep.agentStatus}</span>
                        <span className="badge badge-info">{ep.os} {ep.osVersion}</span>
                        <span className="badge badge-closed">{ep.ipAddress}</span>
                    </div>
                </div>
            </div>

            {msg && <div className="alert-msg alert-msg--info">{msg}</div>}

            <div className="tabs">
                {[['general', '💻 General'], ['apps', '📦 Applications'], ['logins', '👤 Login History'], ['commands', '⚡ Commands'], ['browser', '🌐 Browser History']].map(([k, l]) => (
                    <button key={k} className={`tab ${tab === k ? 'tab--active' : ''}`} onClick={() => setTab(k)}>{l}</button>
                ))}
            </div>

            {tab === 'general' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="card">
                        <div className="card-head"><span className="card-title">Hardware</span></div>
                        <div className="card-body">
                            <div className="info-rows">
                                {[
                                    ['Model', ep.hardwareModel], ['CPU', ep.cpu],
                                    ['RAM', ep.ramGb ? `${ep.ramGb} GB` : '—'],
                                    ['Disk', ep.diskGb ? `${ep.diskGb} GB` : '—'],
                                    ['MAC', ep.macAddress],
                                    ['Last Seen', ep.lastSeen ? new Date(ep.lastSeen).toLocaleString() : '—'],
                                ].map(([l, v]) => (
                                    <div key={l} className="info-row">
                                        <span className="info-label">{l}</span>
                                        <span className="info-value">{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-head"><span className="card-title">FALXDR Agent</span></div>
                        <div className="card-body">
                            <div className="info-rows">
                                {[
                                    ['Version', ep.agentVersion],
                                    ['Status', <span className={`badge ${ep.agentStatus === 'ACTIVE' ? 'badge-resolved' : 'badge-medium'}`}>{ep.agentStatus}</span>],
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
            )}

            {tab === 'apps' && (
                <div className="card">
                    <div className="card-head">
                        <span className="card-title">Installed Applications</span>
                        <span className="card-count">{detail.applications?.length}</span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <input className="input" style={{ flex: 1 }} value={appName} onChange={e => setAppName(e.target.value)} placeholder="Application name to install…" onKeyDown={e => e.key === 'Enter' && installApp()} />
                            <button className="btn btn-primary btn-sm" onClick={installApp} disabled={!appName.trim()}>📥 Install</button>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Version</th><th>Publisher</th><th>Installed</th><th>Action</th></tr></thead>
                            <tbody>
                            {(detail.applications || []).map((a: any) => (
                                <tr key={a.id}>
                                    <td style={{ fontWeight: 600 }}>{a.name}</td>
                                    <td className="mono" style={{ fontSize: 12 }}>{a.version || '—'}</td>
                                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.publisher || '—'}</td>
                                    <td className="mono" style={{ fontSize: 11 }}>{a.installDate ? String(a.installDate) : '—'}</td>
                                    <td><button className="btn btn-xs btn-danger" onClick={() => removeApp(a.id, a.name)}>Remove</button></td>
                                </tr>
                            ))}
                            {!detail.applications?.length && <tr><td colSpan={5}><div className="empty-state" style={{ padding: 24 }}>No applications</div></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'logins' && (
                <div className="card">
                    <div className="card-head"><span className="card-title">Login History</span></div>
                    <div className="card-body">
                        <table className="data-table">
                            <thead><tr><th>Username</th><th>Login Time</th><th>Logout Time</th><th>Type</th></tr></thead>
                            <tbody>
                            {(detail.loginHistory || []).map((l: any) => (
                                <tr key={l.id}>
                                    <td style={{ fontWeight: 600 }}>{l.username}</td>
                                    <td className="mono" style={{ fontSize: 12 }}>{new Date(l.loginTime).toLocaleString()}</td>
                                    <td className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{l.logoutTime ? new Date(l.logoutTime).toLocaleString() : <span className="badge badge-resolved">Active</span>}</td>
                                    <td><span className="badge badge-info">{l.loginType || 'Interactive'}</span></td>
                                </tr>
                            ))}
                            {!detail.loginHistory?.length && <tr><td colSpan={4}><div className="empty-state" style={{ padding: 24 }}>No login history</div></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'commands' && (
                <div className="card">
                    <div className="card-head"><span className="card-title">Command History</span></div>
                    <div className="card-body">
                        <table className="data-table">
                            <thead><tr><th>Timestamp</th><th>User</th><th>Command</th></tr></thead>
                            <tbody>
                            {(detail.commands || []).map((c: any) => (
                                <tr key={c.id}>
                                    <td className="mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(c.executedAt).toLocaleString()}</td>
                                    <td style={{ fontWeight: 600 }}>{c.username || '—'}</td>
                                    <td className="mono" style={{ fontSize: 12, color: 'var(--accent)' }}>{c.command}</td>
                                </tr>
                            ))}
                            {!detail.commands?.length && <tr><td colSpan={3}><div className="empty-state" style={{ padding: 24 }}>No commands recorded</div></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'browser' && (
                <div className="card">
                    <div className="card-head"><span className="card-title">Browser History (last 20)</span></div>
                    <div className="card-body">
                        <table className="data-table">
                            <thead><tr><th>Visited</th><th>Title</th><th>URL</th></tr></thead>
                            <tbody>
                            {(detail.browserHistory || []).map((b: any) => (
                                <tr key={b.id}>
                                    <td className="mono" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{new Date(b.visitedAt).toLocaleString()}</td>
                                    <td style={{ fontSize: 12 }}>{b.title || '—'}</td>
                                    <td>
                                        <a href={b.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', fontSize: 12 }}>{b.url}</a>
                                    </td>
                                </tr>
                            ))}
                            {!detail.browserHistory?.length && <tr><td colSpan={3}><div className="empty-state" style={{ padding: 24 }}>No browser history</div></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}