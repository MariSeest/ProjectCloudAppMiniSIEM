import { useState } from 'react'
import { falxdrApi } from '../api'

export default function AssetDiscovery() {
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [installing, setInstalling] = useState<string | null>(null)
    const [msg, setMsg] = useState('')

    async function scan() {
        setLoading(true)
        try { setAssets(await falxdrApi.discover()) }
        finally { setLoading(false) }
    }

    async function installAgent(id: string, hostname: string) {
        setInstalling(id)
        try {
            await falxdrApi.installAgent(id)
            setMsg(`✅ FALXDR agent installing on ${hostname}…`)
            setAssets(p => p.map(a => a.id === id ? { ...a, agentInstalled: 'true' } : a))
        } finally { setInstalling(null) }
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Asset Discovery</h1>
                    <p className="page-subtitle">Scan the network for new assets and deploy the FALXDR agent</p>
                </div>
                <button className="btn btn-primary" onClick={scan} disabled={loading}>
                    {loading ? '📡 Scanning…' : '📡 Scan Network'}
                </button>
            </div>

            {msg && <div className="alert-msg alert-msg--success">{msg}</div>}

            {assets.length > 0 && (
                <div className="card">
                    <div className="card-head">
                        <span className="card-title">Discovered Assets</span>
                        <span className="card-count">{assets.length} found</span>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr><th>Hostname</th><th>IP Address</th><th>MAC Address</th><th>Agent</th><th>Action</th></tr>
                        </thead>
                        <tbody>
                        {assets.map((a: any) => (
                            <tr key={a.id}>
                                <td style={{ fontWeight: 600 }}>{a.hostname}</td>
                                <td className="mono">{a.ip}</td>
                                <td className="mono" style={{ fontSize: 12 }}>{a.mac}</td>
                                <td>
                    <span className={`badge ${a.agentInstalled === 'true' ? 'badge-resolved' : 'badge-closed'}`}>
                      {a.agentInstalled === 'true' ? 'Installed' : 'Not installed'}
                    </span>
                                </td>
                                <td>
                                    {a.agentInstalled !== 'true' && (
                                        <button className="btn btn-xs btn-primary" disabled={installing === a.id} onClick={() => installAgent(a.id, a.hostname)}>
                                            {installing === a.id ? 'Installing…' : 'Install Agent'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && assets.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state__icon">📡</div>
                    Click "Scan Network" to discover assets connected to the local network
                </div>
            )}
        </div>
    )
}