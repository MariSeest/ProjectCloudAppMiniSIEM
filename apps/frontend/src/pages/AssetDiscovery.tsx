import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { falxdrApi } from '../api'

const STORAGE_KEY = 'minisiem_installed_agents'

function getInstalledAgents(): string[] {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

export default function AssetDiscovery() {
    const navigate = useNavigate()
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [installing, setInstalling] = useState<string | null>(null)
    const [msg, setMsg] = useState('')
    const [installed, setInstalled] = useState<string[]>(getInstalledAgents())

    useEffect(() => {
        setInstalled(getInstalledAgents())
    }, [])

    async function scan() {
        setLoading(true)
        setMsg('')
        try {
            const data = await falxdrApi.discover()
            setAssets(data.map((a: any) => ({ ...a, _key: a.hostname })))
        } finally { setLoading(false) }
    }

    async function installAgent(asset: any) {
        const key = asset._key
        setInstalling(key)
        setMsg('')
        try {
            await new Promise(r => setTimeout(r, 1500))
            const newInstalled = [...getInstalledAgents(), key]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newInstalled))
            const virtualAgent = {
                id: `virtual-${key}`,
                hostname: asset.hostname,
                ipAddress: asset.ipAddress || asset.ip || '—',
                os: asset.os || 'Unknown',
                osVersion: '',
                agentStatus: 'ACTIVE',
                agentVersion: '1.2.3',
                lastSeen: new Date().toISOString(),
                isVirtual: true,
            }
            const agents = JSON.parse(localStorage.getItem('minisiem_virtual_agents') || '[]')
            agents.push(virtualAgent)
            localStorage.setItem('minisiem_virtual_agents', JSON.stringify(agents))
            setInstalled(newInstalled)
            setMsg(`✅ Agent installed on ${asset.hostname}. Redirecting to FALXDR Endpoints…`)
            setTimeout(() => navigate('/falxdr'), 1500)
        } catch (e: any) {
            setMsg(`❌ Failed: ${String(e)}`)
        } finally {
            setInstalling(null)
        }
    }

    const visibleAssets = assets.filter(a => !installed.includes(a._key))

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

            {msg && (
                <div className={`alert-msg ${msg.startsWith('❌') ? 'alert-msg--error' : 'alert-msg--success'}`}>
                    {msg}
                </div>
            )}

            {visibleAssets.length > 0 && (
                <div className="card">
                    <div className="card-head">
                        <span className="card-title">Discovered Assets</span>
                        <span className="card-count">{visibleAssets.length} found</span>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Hostname</th>
                            <th>IP Address</th>
                            <th>OS</th>
                            <th>Agent</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {visibleAssets.map((a: any) => (
                            <tr key={a._key}>
                                <td style={{ fontWeight: 600 }}>{a.hostname}</td>
                                <td className="mono">{a.ipAddress || a.ip || '—'}</td>
                                <td style={{ fontSize: 12 }}>{a.os || '—'}</td>
                                <td>
                                    <span className="badge badge-closed">Not installed</span>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-xs btn-primary"
                                        disabled={installing === a._key}
                                        onClick={() => void installAgent(a)}
                                    >
                                        {installing === a._key ? '⏳ Installing…' : '📥 Install Agent'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && assets.length > 0 && visibleAssets.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state__icon">✅</div>
                    All discovered assets have the FALXDR agent installed.
                    <br />
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/falxdr')}>
                        View FALXDR Endpoints →
                    </button>
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