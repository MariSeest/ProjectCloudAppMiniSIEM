import { useEffect, useState } from 'react'
import { identityApi } from '../api'

export default function IdentityManagement() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState('')

    async function load() {
        setLoading(true)
        identityApi.list().then(setAssets).catch(() => setAssets([])).finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    async function forceReset(id: string, username: string) {
        if (!confirm(`Force password reset for ${username}?`)) return
        await identityApi.forceReset(id)
        setMsg(`✅ Password reset requested for ${username}`)
        await load()
    }

    function PasswordBar({ strength }: { strength: string }) {
        const map: Record<string, { w: string; c: string }> = {
            WEAK: { w: '25%', c: 'var(--danger)' },
            MEDIUM: { w: '55%', c: 'var(--warning)' },
            STRONG: { w: '85%', c: 'var(--success)' },
            VERY_STRONG: { w: '100%', c: '#00e5a0' },
        }
        const v = map[strength] || { w: '10%', c: 'var(--muted2)' }
        return (
            <div className="password-bar">
                <div className="password-bar__fill" style={{ width: v.w, background: v.c }} />
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Identity Management</h1>
                    <p className="page-subtitle">Password strength analysis and force-reset for endpoint user accounts</p>
                </div>
                <button className="btn btn-sm" onClick={load} disabled={loading}>↻ Refresh</button>
            </div>

            {msg && <div className="alert-msg alert-msg--success">{msg}</div>}

            <div className="card">
                <div className="card-head">
                    <span className="card-title">User Password Analysis</span>
                    <span className="card-count">{assets.length} accounts</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th>Username</th><th>Full Name</th><th>Endpoint</th>
                            <th style={{ width: 160 }}>Password Strength</th>
                            <th style={{ width: 130 }}>Last Changed</th>
                            <th style={{ width: 90 }}>Reset</th>
                            <th style={{ width: 110 }}>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assets.length === 0
                            ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-state__icon">🔑</div>No identity data</div></td></tr>
                            : assets.map((a: any) => (
                                <tr key={a.id}>
                                    <td style={{ fontWeight: 600 }}>{a.username}</td>
                                    <td>{a.fullName || '—'}</td>
                                    <td>{a.endpointHostname ? <span className="badge badge-info">{a.endpointHostname}</span> : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <PasswordBar strength={a.passwordStrength} />
                                            <span className={`badge ${a.passwordStrength === 'WEAK' ? 'badge-critical' : a.passwordStrength === 'MEDIUM' ? 'badge-medium' : 'badge-resolved'}`} style={{ fontSize: 10 }}>
                            {a.passwordStrength || 'UNKNOWN'}
                          </span>
                                        </div>
                                    </td>
                                    <td className="mono" style={{ fontSize: 11 }}>
                                        {a.lastPasswordChange ? new Date(a.lastPasswordChange).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td>
                                        {a.forceResetRequested
                                            ? <span className="badge badge-open">Pending</span>
                                            : '—'}
                                    </td>
                                    <td>
                                        <button className="btn btn-xs btn-danger" onClick={() => forceReset(a.id, a.username)} disabled={a.forceResetRequested}>
                                            Force Reset
                                        </button>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}