import { useEffect, useState } from 'react'

interface NewsItem {
    title: string
    description: string
    url: string
    source: string
    publishedAt: string
    category: string
}

const RSS_FEEDS = [
    { url: 'https://feeds.feedburner.com/TheHackersNews', source: 'The Hacker News' },
    { url: 'https://www.bleepingcomputer.com/feed/', source: 'BleepingComputer' },
    { url: 'https://threatpost.com/feed/', source: 'Threatpost' },
]

const CORS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url='

export default function CyberNews() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<NewsItem | null>(null)
    const [filter, setFilter] = useState('ALL')

    useEffect(() => { void loadNews() }, [])

    async function loadNews() {
        setLoading(true)
        const all: NewsItem[] = []

        for (const feed of RSS_FEEDS) {
            try {
                const res = await fetch(`${CORS_PROXY}${encodeURIComponent(feed.url)}&count=10`)
                const data = await res.json()
                if (data.items) {
                    for (const item of data.items) {
                        all.push({
                            title: item.title,
                            description: (item.description || '').replace(/<[^>]*>/g, '').slice(0, 400),
                            url: item.link,
                            source: feed.source,
                            publishedAt: item.pubDate,
                            category: detectCategory(item.title + ' ' + item.description),
                        })
                    }
                }
            } catch {
                console.warn(`Failed to load ${feed.source}`)
            }
        }

        all.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        setNews(all)
        setLoading(false)
    }

    function detectCategory(text: string): string {
        const t = text.toLowerCase()
        if (t.includes('ransomware') || t.includes('malware') || t.includes('trojan') || t.includes('backdoor')) return 'MALWARE'
        if (t.includes('vulnerability') || t.includes('cve') || t.includes('patch') || t.includes('zero-day')) return 'VULNERABILITY'
        if (t.includes('breach') || t.includes('leak') || t.includes('stolen') || t.includes('exposed')) return 'BREACH'
        if (t.includes('phishing') || t.includes('social engineering') || t.includes('scam')) return 'PHISHING'
        if (t.includes('apt') || t.includes('nation') || t.includes('espionage') || t.includes('state-sponsored')) return 'APT'
        return 'GENERAL'
    }

    function categoryColor(c: string) {
        switch (c) {
            case 'MALWARE': return 'badge-critical'
            case 'VULNERABILITY': return 'badge-high'
            case 'BREACH': return 'badge-high'
            case 'PHISHING': return 'badge-medium'
            case 'APT': return 'badge-critical'
            default: return 'badge-low'
        }
    }

    const filtered = filter === 'ALL' ? news : news.filter(n => n.category === filter)
    const categories = ['ALL', 'MALWARE', 'VULNERABILITY', 'BREACH', 'PHISHING', 'APT', 'GENERAL']

    return (
        <div className="page">
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ fontSize: 16, lineHeight: 1.4 }}>{selected.title}</h2>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className={`badge ${categoryColor(selected.category)}`}>{selected.category}</span>
                                <span style={{ color: 'var(--muted2)', fontSize: 12 }}>{selected.source}</span>
                                <span style={{ color: 'var(--muted2)', fontSize: 12 }}>
                                    {new Date(selected.publishedAt).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text)', lineHeight: 1.7, marginBottom: 16 }}>{selected.description}</p>
                            <a href={selected.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                📰 Leggi articolo completo
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <div>
                    <h1 className="page-title">Cyber News</h1>
                    <p className="page-subtitle">Latest cybersecurity news from The Hacker News, BleepingComputer, Threatpost</p>
                </div>
                <button className="btn" onClick={() => void loadNews()} disabled={loading}>🔄 Refresh</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {categories.map(c => (
                    <button
                        key={c}
                        className={`btn ${filter === c ? 'btn-primary' : ''}`}
                        style={{ fontSize: 12 }}
                        onClick={() => setFilter(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            {loading
                ? <div className="loading-wrap"><div className="spinner" /></div>
                : (
                    <div className="card">
                        <div className="card-head">
                            <span className="card-title">Latest News</span>
                            <span className="card-count">{filtered.length} articles</span>
                        </div>
                        <div>
                            {filtered.length === 0
                                ? <div className="empty-state"><div className="empty-state__icon">📰</div>No news found.</div>
                                : filtered.map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '14px 16px',
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setSelected(item)}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4, lineHeight: 1.4 }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                                                    {item.description?.slice(0, 150)}...
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 130 }}>
                                                <span className={`badge ${categoryColor(item.category)}`}>{item.category}</span>
                                                <span style={{ fontSize: 11, color: 'var(--muted2)' }}>{item.source}</span>
                                                <span style={{ fontSize: 11, color: 'var(--muted2)', fontFamily: 'monospace' }}>
                                                    {new Date(item.publishedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}