export function SeverityBadge({ severity }: { severity: string }) {
    const s = (severity || '').toUpperCase()
    const cls = s === 'CRITICAL' ? 'badge-critical' : s === 'HIGH' ? 'badge-high' : s === 'MEDIUM' ? 'badge-medium' : 'badge-low'
    return <span className={`badge ${cls}`}>{s}</span>
}

export function StatusBadge({ status }: { status: string }) {
    const s = (status || '').toUpperCase()
    const cls = s === 'OPEN' ? 'badge-open' : s === 'RESOLVED' ? 'badge-resolved' : 'badge-closed'
    return <span className={`badge ${cls}`}>{s}</span>
}

export function NumericSeverityBadge({ severity }: { severity: number }) {
    const label = severity >= 8 ? 'CRITICAL' : severity >= 6 ? 'HIGH' : severity >= 4 ? 'MEDIUM' : 'LOW'
    const cls = severity >= 8 ? 'badge-critical' : severity >= 6 ? 'badge-high' : severity >= 4 ? 'badge-medium' : 'badge-low'
    return <span className={`badge ${cls}`}>{label} {severity}</span>
}

export function CommentSection({ getComments, addComment }: {
    getComments: () => Promise<any[]>
    addComment: (content: string) => Promise<any>
}) {
    const [comments, setComments] = useState<any[]>([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => { getComments().then(setComments).catch(() => {}) }, [])

    async function submit() {
        if (!text.trim()) return
        setLoading(true)
        try {
            const c = await addComment(text)
            setComments(p => [...p, c])
            setText('')
        } finally { setLoading(false) }
    }

    return (
        <div className="card">
            <div className="card-head">
                <span className="card-title">💬 Comments</span>
                <span className="card-count">{comments.length}</span>
            </div>
            <div className="card-body">
                <div className="comment-list">
                    {comments.length === 0 && (
                        <p style={{ color: 'var(--muted2)', fontSize: 13 }}>No comments yet. Be the first.</p>
                    )}
                    {comments.map((c: any) => (
                        <div key={c.id} className="comment-item">
                            <div className="comment-header">
                                <div className="comment-avatar">
                                    {(c.authorName || c.authorUsername || '?')[0].toUpperCase()}
                                </div>
                                <span className="comment-author">{c.authorName || c.authorUsername}</span>
                                <span className="comment-time">{new Date(c.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="comment-text">{c.content}</div>
                        </div>
                    ))}
                </div>
                <div className="comment-form">
          <textarea
              className="textarea"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              style={{ minHeight: 60 }}
          />
                    <button className="btn btn-primary btn-sm" onClick={submit} disabled={loading || !text.trim()}>
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'