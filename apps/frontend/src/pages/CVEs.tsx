import { useState } from 'react'
import { cvesApi } from '../api'

export default function CVEs() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [total, setTotal] = useState(0)

    async function search() {
        if (!query.trim()) return
        setLoading(true)
        setError('')
        try {
            const data = await cvesApi.list(query, 20)
            if (Array.isArray(data)) {
                setResults(data)
                setTotal(data.length)
            } else if (data?.vulnerabilities) {
                setResults(data.vulnerabilities)
                setTotal(data.totalResults || data.vulnerabilities.length)
            } else {
                setResults([])
                setTotal(0)
            }
        } catch {
            setError('Error fetching CVEs. Check connection.')
        } finally {
            setLoading(false)
        }
    }

    function renderRow(item: any) {
        if (item?.cve) {
            const cve = item.cve
            const metrics = cve.metrics?.cvssMetricV31?.[0] ||
                cve.metrics?.cvssMetricV30?.[0] ||
                cve.metrics?.cvssMetricV2?.[0]
            const score = metrics?.cvssData?.baseScore
            const severity = metrics?.cvssData?.baseSeverity ||
                (score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW')
            const desc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || '—'
            return (
                <tr key={cve.id}>
                    <td><a className="tag" href={`https://nvd.nist.gov/vuln/detail/${cve.id}`} target="_blank" rel="noreferrer">{cve.id}</a></td>
                    <td>{severity && <span className={`badge badge-${severity.toLowerCase()}`}>{severity}</span>}</td>
                    <td style={{ fontWeight: 700, color: score >= 9 ? 'var(--danger)' : score >= 7 ? 'var(--warning)' : 'var(--success)' }}>{score ?? '—'}</td>
                    <td style={{ color: 'var(--muted)', fontSize: 12 }}>{desc}</td>
                    <td className="mono" style={{ fontSize: 11 }}>{cve.published?.slice(0, 10)}</td>
                </tr>
            )
        }

        const sev = (item.severity || 'UNKNOWN').toUpperCase()
        const sevClass = sev === 'CRITICAL' ? 'badge-critical' : sev === 'HIGH' ? 'badge-high' : sev === 'MEDIUM' ? 'badge-medium' : 'badge-low'
        return (
            <tr key={item.cveId || item.id}>
                <td><span className="tag">{item.cveId || item.name || item.id}</span></td>
                <td><span className={`badge ${sevClass}`}>{sev}</span></td>
                <td style={{ fontWeight: 700 }}>{item.score ?? '—'}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{item.description || '—'}</td>
                <td className="mono" style={{ fontSize: 11 }}>{item.created?.slice(0, 10) || '—'}</td>
            </tr>
        )
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">CVE Search</h1>
                    <p className="page-subtitle">Search vulnerabilities from OpenCTI and NVD</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
                <input
                    className="input"
                    style={{ flex: 1 }}
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && void search()}
                    placeholder="Search CVEs e.g. log4j, apache, CVE-2024-..."
                />
                <button className="btn btn-primary" onClick={() => void search()} disabled={loading || !query.trim()}>
                    {loading ? 'Searching…' : '🔍 Search'}
                </button>
            </div>

            {error && <div className="alert-msg alert-msg--error">{error}</div>}
            {total > 0 && <p style={{ fontSize: 13, color: 'var(--muted)' }}>{total} results found</p>}

            {results.length > 0 && (
                <div className="card">
                    <div className="card-head">
                        <span className="card-title">CVE Results</span>
                        <span className="card-count">{results.length} shown</span>
                    </div>
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th style={{ width: 160 }}>CVE ID</th>
                            <th style={{ width: 100 }}>Severity</th>
                            <th style={{ width: 60 }}>Score</th>
                            <th>Description</th>
                            <th style={{ width: 100 }}>Published</th>
                        </tr>
                        </thead>
                        <tbody>{results.map(renderRow)}</tbody>
                    </table>
                </div>
            )}

            {!loading && results.length === 0 && query && !error && (
                <div className="empty-state">
                    <div className="empty-state__icon">🔍</div>
                    No results for "{query}"
                </div>
            )}
        </div>
    )
}