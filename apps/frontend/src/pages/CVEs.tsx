import { useEffect, useState } from 'react'
import { cvesApi } from '../api'

interface Cve {
    cveId: string
    description: string
    severity: string
    score: number | null
    created: string
    modified: string
    externalUrl: string | null
}

function severityColor(s: string) {
    switch (s?.toUpperCase()) {
        case 'CRITICAL': return 'badge-critical'
        case 'HIGH': return 'badge-high'
        case 'MEDIUM': return 'badge-medium'
        case 'LOW': return 'badge-low'
        default: return 'badge-unknown'
    }
}

export default function CVEs() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Cve[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [selected, setSelected] = useState<Cve | null>(null)

    async function search(q = query) {
        setLoading(true)
        setError('')
        try {
            const data = await cvesApi.list(q, 20)
            setResults(Array.isArray(data) ? data : [])
        } catch {
            setError('Error fetching CVEs. Check connection.')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { void search('') }, [])

    return (
        <div className="page">
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selected.cveId}</h2>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
                                <span className={`badge ${severityColor(selected.severity)}`}>{selected.severity}</span>
                                {selected.score != null && (
                                    <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>
                                        Score: {selected.score.toFixed(1)}
                                    </span>
                                )}
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ color: 'var(--muted2)', fontSize: 12, marginBottom: 4 }}>DESCRIZIONE</div>
                                <p style={{ color: 'var(--text)', lineHeight: 1.6 }}>
                                    {selected.description || 'Nessuna descrizione disponibile.'}
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                                <div>
                                    <div style={{ color: 'var(--muted2)', fontSize: 12 }}>PUBBLICATO</div>
                                    <div style={{ color: 'var(--text)', fontSize: 13 }}>
                                        {selected.created ? new Date(selected.created).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--muted2)', fontSize: 12 }}>AGGIORNATO</div>
                                    <div style={{ color: 'var(--text)', fontSize: 13 }}>
                                        {selected.modified ? new Date(selected.modified).toLocaleDateString() : '—'}
                                    </div>
                                </div>
                            </div>
                            {selected.externalUrl && (
                                <div style={{ marginTop: 16 }}>
                                    <a href={selected.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        🔗 Vedi su NVD
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">CVE Search</h1>
                    <p className="page-subtitle">Search vulnerabilities from OpenCTI and NVD</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <input
                    className="input"
                    style={{ flex: 1 }}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search CVEs e.g. log4j, apache, CVE-2024-..."
                    onKeyDown={(e) => e.key === 'Enter' && void search()}
                />
                <button className="btn btn-primary" onClick={() => void search()} disabled={loading}>
                    🔍 Search
                </button>
            </div>

            {error && <div className="alert-msg alert-msg--danger">{error}</div>}

            {loading
                ? <div className="loading-wrap"><div className="spinner" /></div>
                : (
                    <div className="card">
                        <div className="card-head">
                            <span className="card-title">CVE Results</span>
                            <span className="card-count">{results.length} shown</span>
                        </div>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>CVE ID</th>
                                <th>SEVERITY</th>
                                <th>SCORE</th>
                                <th>DESCRIPTION</th>
                                <th>PUBLISHED</th>
                            </tr>
                            </thead>
                            <tbody>
                            {results.length === 0
                                ? <tr><td colSpan={5}><div className="empty-state"><div className="empty-state__icon">🔍</div>No results. Try a different search.</div></td></tr>
                                : results.map((c, i) => (
                                    <tr key={i} style={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                                        <td>
                                            <span style={{ color: 'var(--primary)', fontWeight: 600, fontFamily: 'monospace' }}>
                                                {c.cveId}
                                            </span>
                                        </td>
                                        <td><span className={`badge ${severityColor(c.severity)}`}>{c.severity}</span></td>
                                        <td style={{ fontWeight: 600 }}>{c.score != null ? c.score.toFixed(1) : '—'}</td>
                                        <td style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 400 }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                                                {c.description || '—'}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'monospace' }}>
                                            {c.created ? new Date(c.created).toLocaleDateString() : '—'}
                                        </td>
                                    </tr>
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                )
            }
        </div>
    )
}