import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { incidentsApi } from '../api'

type NodePos = { x: number; y: number }
type DragState = { id: string; ox: number; oy: number; mx: number; my: number } | null

const SEV_COLOR: Record<string, string> = {
    CRITICAL: '#ff4d6d', HIGH: '#ff6432', MEDIUM: '#ffb347', LOW: '#00e5a0',
}
const NODE_W = 168, NODE_H = 58

export default function CorrelationWorkspace() {
    const navigate = useNavigate()
    const svgRef = useRef<SVGSVGElement>(null)
    const [incidents, setIncidents] = useState<any[]>([])
    const [positions, setPositions] = useState<Record<string, NodePos>>({})
    const [drag, setDrag] = useState<DragState>(null)
    const [connecting, setConnecting] = useState(false)
    const [connectFrom, setConnectFrom] = useState<string | null>(null)
    const [pendingTo, setPendingTo] = useState<string | null>(null)
    const [corrType, setCorrType] = useState('same attack vector')
    const [showLabelModal, setShowLabelModal] = useState(false)
    const [showSummary, setShowSummary] = useState(false)
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)
        const data = await incidentsApi.list()
        setIncidents(data)
        const pos: Record<string, NodePos> = {}
        const cx = 600, cy = 300, r = 230
        data.forEach((inc: any, i: number) => {
            const angle = (2 * Math.PI * i) / data.length - Math.PI / 2
            pos[inc.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
        })
        setPositions(pos)
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    const allEdges = incidents.flatMap((i: any) =>
        (i.correlations || []).filter((c: any) => c.incidentId1 === i.id)
    )

    const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        if (connecting) return
        e.stopPropagation()
        const svg = svgRef.current!
        const pt = svg.createSVGPoint()
        pt.x = e.clientX; pt.y = e.clientY
        const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
        setDrag({ id, ox: positions[id]?.x ?? 0, oy: positions[id]?.y ?? 0, mx: svgP.x, my: svgP.y })
    }, [connecting, positions])

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!drag) return
        const svg = svgRef.current!
        const pt = svg.createSVGPoint()
        pt.x = e.clientX; pt.y = e.clientY
        const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse())
        setPositions(p => ({ ...p, [drag.id]: { x: drag.ox + svgP.x - drag.mx, y: drag.oy + svgP.y - drag.my } }))
    }, [drag])

    function handleNodeClick(id: string) {
        if (!connecting) return
        if (!connectFrom) { setConnectFrom(id); return }
        if (connectFrom === id) { setConnectFrom(null); return }
        setPendingTo(id); setShowLabelModal(true)
    }

    async function confirmEdge() {
        if (!connectFrom || !pendingTo) return
        await incidentsApi.correlate({ incidentId1: connectFrom, incidentId2: pendingTo, correlationType: corrType })
        setConnectFrom(null); setPendingTo(null); setCorrType('same attack vector')
        setShowLabelModal(false); setConnecting(false)
        await load()
    }

    async function deleteEdge(corrId: string) {
        await incidentsApi.deleteCorrelation(corrId)
        await load()
    }

    const incMap = Object.fromEntries(incidents.map((i: any) => [i.id, i]))

    return (
        <div className="corr-page">
            <div className="corr-toolbar">
                <div className="corr-toolbar__left">
                    <button className="btn btn-sm" onClick={() => navigate('/incidents')}>← Incidents</button>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, background: 'linear-gradient(90deg,var(--text) 50%,var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        ⬡ Correlation Workspace
                    </h1>
                </div>
                <div className="corr-toolbar__right">
                    <button className={`btn btn-sm ${connecting ? 'btn-primary' : ''}`}
                            onClick={() => { setConnecting(c => !c); setConnectFrom(null) }}>
                        {connecting
                            ? connectFrom ? `From ${incMap[connectFrom]?.title?.slice(0, 12)}… → click target` : 'Click source node'
                            : '🔗 Connect'}
                    </button>
                    <button className="btn btn-sm" onClick={() => setShowSummary(true)}>📋 Summary</button>
                    <button className="btn btn-sm" onClick={load} disabled={loading}>↻</button>
                </div>
            </div>

            <div className="corr-legend">
                {Object.entries(SEV_COLOR).map(([sev, color]) => (
                    <span key={sev} className="corr-legend__item">
            <span className="corr-legend__dot" style={{ background: color }} />{sev}
          </span>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted2)' }}>
          {connecting ? '🔴 Connect mode — correlations saved to DB' : 'Drag nodes · Click Connect to correlate · All data saved to DB'}
        </span>
            </div>

            <div className="corr-canvas">
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1200 640"
                           onMouseMove={onMouseMove}
                           onMouseUp={() => setDrag(null)}
                           onMouseLeave={() => setDrag(null)}>
                        <defs>
                            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                                <path d="M0,0 L0,6 L8,3 z" fill="rgba(58,169,255,0.7)" />
                            </marker>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(58,169,255,0.05)" strokeWidth="1" />
                        </pattern>
                        <rect width="1200" height="640" fill="url(#grid)" />

                        {allEdges.map((edge: any) => {
                            const from = positions[edge.incidentId1]
                            const to = positions[edge.incidentId2]
                            if (!from || !to) return null
                            const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
                            return (
                                <g key={edge.id}>
                                    <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                          stroke="rgba(58,169,255,0.45)" strokeWidth="1.5" strokeDasharray="6 3" markerEnd="url(#arrow)" />
                                    {edge.correlationType && (
                                        <text x={mx} y={my - 10} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="11">
                                            {edge.correlationType}
                                        </text>
                                    )}
                                    <circle cx={mx} cy={my} r="9" fill="rgba(255,77,109,0.12)" stroke="rgba(255,77,109,0.4)" strokeWidth="1"
                                            style={{ cursor: 'pointer' }} onClick={() => deleteEdge(edge.id)} />
                                    <text x={mx} y={my + 4} textAnchor="middle" fill="rgba(255,77,109,0.9)" fontSize="11"
                                          style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => deleteEdge(edge.id)}>✕</text>
                                </g>
                            )
                        })}

                        {incidents.map((inc: any) => {
                            const pos = positions[inc.id]
                            if (!pos) return null
                            const color = SEV_COLOR[inc.severity] ?? '#3aa9ff'
                            const isSource = connectFrom === inc.id
                            const hasCorr = (inc.correlations || []).length > 0
                            return (
                                <g key={inc.id}
                                   transform={`translate(${pos.x - NODE_W / 2},${pos.y - NODE_H / 2})`}
                                   style={{ cursor: connecting ? 'crosshair' : 'grab' }}
                                   onMouseDown={e => onMouseDown(e, inc.id)}
                                   onClick={() => handleNodeClick(inc.id)}>
                                    {isSource && (
                                        <rect x="-4" y="-4" width={NODE_W + 8} height={NODE_H + 8} rx="14"
                                              fill="none" stroke="rgba(58,169,255,0.7)" strokeWidth="2"
                                              strokeDasharray="4 2" filter="url(#glow)" />
                                    )}
                                    <rect width={NODE_W} height={NODE_H} rx="10"
                                          fill="rgba(8,18,40,0.93)"
                                          stroke={isSource ? 'rgba(58,169,255,0.9)' : `${color}55`}
                                          strokeWidth={isSource ? 2 : 1.5} />
                                    <rect width="4" height={NODE_H} rx="2" fill={color} opacity="0.9" />
                                    {hasCorr && (
                                        <circle cx={NODE_W - 8} cy={8} r="5" fill="rgba(58,169,255,0.9)"
                                                stroke="rgba(8,18,40,0.9)" strokeWidth="1.5" filter="url(#glow)" />
                                    )}
                                    <text x="14" y="22" fill="rgba(255,255,255,0.93)" fontSize="12" fontWeight="700"
                                          style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                        {inc.title.length > 19 ? inc.title.slice(0, 19) + '…' : inc.title}
                                    </text>
                                    <text x="14" y="39" fill="rgba(255,255,255,0.42)" fontSize="10"
                                          style={{ pointerEvents: 'none', userSelect: 'none' }}>
                                        #{inc.id?.slice(0, 8)} · {inc.severity}
                                    </text>
                                    <text x={NODE_W - 13} y={NODE_H - 9} fill="rgba(58,169,255,0.7)" fontSize="11" textAnchor="middle"
                                          style={{ cursor: 'pointer', userSelect: 'none' }}
                                          onClick={e => { e.stopPropagation(); navigate(`/incidents/${inc.id}`) }}>↗</text>
                                </g>
                            )
                        })}
                    </svg>
                }
            </div>

            {showLabelModal && (
                <div className="modal-overlay" onClick={() => { setShowLabelModal(false); setConnectFrom(null); setPendingTo(null) }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Add Correlation</h3>
                        <p className="modal-sub">
                            <strong>{incMap[connectFrom!]?.title}</strong> → <strong>{incMap[pendingTo!]?.title}</strong>
                        </p>
                        <div className="field">
                            <label className="field-label">Correlation Type</label>
                            <input className="input" value={corrType} onChange={e => setCorrType(e.target.value)}
                                   placeholder="same attack vector, related CVE…" autoFocus
                                   onKeyDown={e => e.key === 'Enter' && confirmEdge()} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => { setShowLabelModal(false); setConnectFrom(null); setPendingTo(null) }}>Cancel</button>
                            <button className="btn btn-primary" onClick={confirmEdge}>Save to DB</button>
                        </div>
                    </div>
                </div>
            )}

            {showSummary && (
                <div className="modal-overlay" onClick={() => setShowSummary(false)}>
                    <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">📋 Correlation Summary</h3>
                        <p className="modal-sub">{allEdges.length} correlation{allEdges.length !== 1 ? 's' : ''} · {incidents.length} incidents · All persisted to DB</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto', margin: '12px 0' }}>
                            {allEdges.length === 0
                                ? <p style={{ color: 'var(--muted2)', padding: '16px 0', textAlign: 'center' }}>No correlations yet.</p>
                                : allEdges.map((edge: any) => (
                                    <div key={edge.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <span className="badge" style={{ borderColor: SEV_COLOR[incMap[edge.incidentId1]?.severity], fontFamily: 'monospace', fontSize: 11 }}>
                      {edge.incidentTitle1 || incMap[edge.incidentId1]?.title}
                    </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted)', fontSize: 13 }}>
                                            <span style={{ fontSize: 10, color: 'var(--accent)', fontStyle: 'italic' }}>{edge.correlationType}</span>→
                                        </div>
                                        <span className="badge" style={{ borderColor: SEV_COLOR[incMap[edge.incidentId2]?.severity], fontFamily: 'monospace', fontSize: 11 }}>
                      {edge.incidentTitle2 || incMap[edge.incidentId2]?.title}
                    </span>
                                        <button onClick={() => deleteEdge(edge.id)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowSummary(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}