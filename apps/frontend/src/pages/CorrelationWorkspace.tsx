import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listIncidents } from "../api/incidents";
import type { Incident } from "../models/incident";
import { getEdges, addEdge, removeEdge, type CorrelationEdge } from "../models/correlation";
import "../styles/correlation.css";

type NodePos = { x: number; y: number };
type DragState = { id: string; ox: number; oy: number; mx: number; my: number } | null;

const SEV_COLOR: Record<string, string> = {
    CRITICAL: "#ff4d6d",
    HIGH:     "#ff6432",
    MEDIUM:   "#ffb347",
    LOW:      "#00e5a0",
};

export default function CorrelationWorkspace() {
    const navigate = useNavigate();
    const svgRef = useRef<SVGSVGElement>(null);

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [edges, setEdges]         = useState<CorrelationEdge[]>([]);
    const [positions, setPositions] = useState<Record<string, NodePos>>({});
    const [drag, setDrag]           = useState<DragState>(null);

    // Connecting mode
    const [connecting, setConnecting]         = useState(false);
    const [connectFrom, setConnectFrom]       = useState<string | null>(null);
    const [connectLabel, setConnectLabel]     = useState("");
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [pendingTo, setPendingTo]           = useState<string | null>(null);

    // Summary panel
    const [showSummary, setShowSummary] = useState(false);

    useEffect(() => {
        listIncidents().then(data => {
            setIncidents(data);
            setEdges(getEdges());
            // Layout circolare iniziale
            const pos: Record<string, NodePos> = {};
            const cx = 600, cy = 320, r = 240;
            data.forEach((inc, i) => {
                const angle = (2 * Math.PI * i) / data.length - Math.PI / 2;
                pos[String(inc.id)] = {
                    x: cx + r * Math.cos(angle),
                    y: cy + r * Math.sin(angle),
                };
            });
            setPositions(pos);
        });
    }, []);

    function refreshEdges() { setEdges(getEdges()); }

    /* ── Drag logic ── */
    const onMouseDown = useCallback((e: React.MouseEvent, id: string) => {
        if (connecting) return;
        e.stopPropagation();
        const svg = svgRef.current!;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
        setDrag({ id, ox: positions[id]?.x ?? 0, oy: positions[id]?.y ?? 0, mx: svgP.x, my: svgP.y });
    }, [connecting, positions]);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!drag) return;
        const svg = svgRef.current!;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
        setPositions(p => ({
            ...p,
            [drag.id]: { x: drag.ox + svgP.x - drag.mx, y: drag.oy + svgP.y - drag.my }
        }));
    }, [drag]);

    const onMouseUp = useCallback(() => setDrag(null), []);

    /* ── Connect logic ── */
    function handleNodeClick(id: string) {
        if (!connecting) return;
        if (!connectFrom) {
            setConnectFrom(id);
            return;
        }
        if (connectFrom === id) { setConnectFrom(null); return; }
        // mostra modal label
        setPendingTo(id);
        setShowLabelModal(true);
    }

    function confirmEdge() {
        if (!connectFrom || !pendingTo) return;
        addEdge(connectFrom, pendingTo, connectLabel);
        refreshEdges();
        setConnectFrom(null); setPendingTo(null);
        setConnectLabel(""); setShowLabelModal(false);
        setConnecting(false);
    }

    function handleDeleteEdge(id: string) {
        removeEdge(id);
        refreshEdges();
    }

    /* ── Summary ── */
    const incMap = Object.fromEntries(incidents.map(i => [String(i.id), i]));

    const NODE_W = 160, NODE_H = 56;

    return (
        <div className="corr-page">
            {/* Toolbar */}
            <div className="corr-toolbar">
                <div className="corr-toolbar__left">
                    <button className="inc-btn inc-btn--ghost" onClick={() => navigate("/incidents")}>
                        ← Incidents
                    </button>
                    <h1 className="corr-title">⬡ Correlation Workspace</h1>
                </div>
                <div className="corr-toolbar__right">
                    <button
                        className={`inc-btn ${connecting ? "inc-btn--accent-active" : "inc-btn--accent"}`}
                        onClick={() => { setConnecting(c => !c); setConnectFrom(null); }}
                    >
                        {connecting ? (connectFrom ? `From #${connectFrom} → click target` : "Click source node") : "🔗 Connect"}
                    </button>
                    <button className="inc-btn inc-btn--primary" onClick={() => setShowSummary(true)}>
                        📋 Summary
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="corr-legend">
                {Object.entries(SEV_COLOR).map(([sev, color]) => (
                    <span key={sev} className="corr-legend__item">
                        <span className="corr-legend__dot" style={{ background: color }} />
                        {sev}
                    </span>
                ))}
                <span className="corr-legend__sep" />
                <span className="corr-legend__hint">
                    {connecting ? "🔴 Connect mode: click source, then target" : "Drag nodes · Click Connect to correlate"}
                </span>
            </div>

            {/* SVG Canvas */}
            <div className="corr-canvas">
                <svg
                    ref={svgRef}
                    width="100%" height="100%"
                    viewBox="0 0 1200 640"
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                >
                    <defs>
                        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                            <path d="M0,0 L0,6 L8,3 z" fill="rgba(58,169,255,0.7)" />
                        </marker>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* Grid */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(58,169,255,0.05)" strokeWidth="1" />
                    </pattern>
                    <rect width="1200" height="640" fill="url(#grid)" />

                    {/* Edges */}
                    {edges.map(edge => {
                        const from = positions[edge.fromId];
                        const to   = positions[edge.toId];
                        if (!from || !to) return null;
                        const mx = (from.x + to.x) / 2;
                        const my = (from.y + to.y) / 2;
                        return (
                            <g key={edge.id}>
                                <line
                                    x1={from.x} y1={from.y}
                                    x2={to.x}   y2={to.y}
                                    stroke="rgba(58,169,255,0.45)"
                                    strokeWidth="1.5"
                                    strokeDasharray="6 3"
                                    markerEnd="url(#arrow)"
                                />
                                {/* Label */}
                                {edge.label && (
                                    <text x={mx} y={my - 8} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="11">
                                        {edge.label}
                                    </text>
                                )}
                                {/* Delete button */}
                                <circle cx={mx} cy={my} r="8" fill="rgba(255,77,109,0.15)" stroke="rgba(255,77,109,0.4)" strokeWidth="1"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleDeleteEdge(edge.id)} />
                                <text x={mx} y={my + 4} textAnchor="middle" fill="rgba(255,77,109,0.9)" fontSize="10"
                                      style={{ cursor: "pointer", userSelect: "none" }}
                                      onClick={() => handleDeleteEdge(edge.id)}>✕</text>
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {incidents.map(inc => {
                        const pos = positions[String(inc.id)];
                        if (!pos) return null;
                        const color = SEV_COLOR[inc.severity] ?? "#3aa9ff";
                        const isSource = connectFrom === String(inc.id);
                        const hasCorr = edges.some(e => e.fromId === String(inc.id) || e.toId === String(inc.id));

                        return (
                            <g key={inc.id}
                               transform={`translate(${pos.x - NODE_W / 2}, ${pos.y - NODE_H / 2})`}
                               style={{ cursor: connecting ? "crosshair" : "grab" }}
                               onMouseDown={e => onMouseDown(e, String(inc.id))}
                               onClick={() => handleNodeClick(String(inc.id))}
                            >
                                {/* Glow ring if selected */}
                                {isSource && (
                                    <rect x="-4" y="-4" width={NODE_W + 8} height={NODE_H + 8} rx="14"
                                          fill="none" stroke="rgba(58,169,255,0.7)" strokeWidth="2"
                                          strokeDasharray="4 2" filter="url(#glow)" />
                                )}

                                {/* Node body */}
                                <rect width={NODE_W} height={NODE_H} rx="10"
                                      fill="rgba(8,18,40,0.92)"
                                      stroke={isSource ? "rgba(58,169,255,0.9)" : `${color}55`}
                                      strokeWidth={isSource ? 2 : 1.5}
                                />

                                {/* Color bar left */}
                                <rect width="4" height={NODE_H} rx="2" fill={color} opacity="0.85" />

                                {/* Correlation dot */}
                                {hasCorr && (
                                    <circle cx={NODE_W - 8} cy={8} r="5"
                                            fill="rgba(58,169,255,0.9)"
                                            stroke="rgba(8,18,40,0.9)" strokeWidth="1.5"
                                            filter="url(#glow)" />
                                )}

                                {/* Title */}
                                <text x="14" y="22" fill="rgba(255,255,255,0.92)" fontSize="12" fontWeight="700"
                                      style={{ pointerEvents: "none", userSelect: "none" }}>
                                    {inc.title.length > 18 ? inc.title.slice(0, 18) + "…" : inc.title}
                                </text>

                                {/* Subtitle */}
                                <text x="14" y="38" fill="rgba(255,255,255,0.45)" fontSize="10"
                                      style={{ pointerEvents: "none", userSelect: "none" }}>
                                    #{inc.id} · {inc.severity}
                                </text>

                                {/* Open button */}
                                <text x={NODE_W - 14} y={NODE_H - 10}
                                      fill="rgba(58,169,255,0.7)" fontSize="10" textAnchor="middle"
                                      style={{ cursor: "pointer", userSelect: "none" }}
                                      onClick={e => { e.stopPropagation(); navigate(`/incidents/${inc.id}`); }}>
                                    ↗
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>

            {/* Label modal */}
            {showLabelModal && (
                <div className="corr-modal-overlay" onClick={() => { setShowLabelModal(false); setConnectFrom(null); setPendingTo(null); }}>
                    <div className="corr-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="corr-modal__title">Add Correlation Label</h3>
                        <p className="corr-modal__sub">
                            #{connectFrom} → #{pendingTo}
                        </p>
                        <input
                            className="inc-input"
                            value={connectLabel}
                            onChange={e => setConnectLabel(e.target.value)}
                            placeholder="e.g. Same attack vector, Related CVE…"
                            autoFocus
                            onKeyDown={e => e.key === "Enter" && confirmEdge()}
                        />
                        <div className="corr-modal__actions">
                            <button className="inc-btn inc-btn--primary" onClick={confirmEdge}>Confirm</button>
                            <button className="inc-btn inc-btn--ghost" onClick={() => { setShowLabelModal(false); setConnectFrom(null); setPendingTo(null); }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary panel */}
            {showSummary && (
                <div className="corr-modal-overlay" onClick={() => setShowSummary(false)}>
                    <div className="corr-modal corr-modal--wide" onClick={e => e.stopPropagation()}>
                        <h3 className="corr-modal__title">📋 Correlation Summary</h3>
                        <p className="corr-modal__sub">{edges.length} correlation{edges.length !== 1 ? "s" : ""} across {incidents.length} incidents</p>

                        {edges.length === 0 ? (
                            <p className="inc-none" style={{ padding: "16px 0" }}>No correlations defined yet.</p>
                        ) : (
                            <div className="corr-summary-list">
                                {edges.map(edge => {
                                    const from = incMap[edge.fromId];
                                    const to   = incMap[edge.toId];
                                    return (
                                        <div key={edge.id} className="corr-summary-item">
                                            <div className="corr-summary-item__from">
                                                <span className="corr-summary-item__badge" style={{ borderColor: SEV_COLOR[from?.severity ?? "LOW"] }}>
                                                    #{edge.fromId}
                                                </span>
                                                <span className="corr-summary-item__name">{from?.title ?? "Unknown"}</span>
                                            </div>
                                            <div className="corr-summary-item__arrow">
                                                {edge.label
                                                    ? <span className="corr-summary-item__label">{edge.label}</span>
                                                    : null}
                                                →
                                            </div>
                                            <div className="corr-summary-item__to">
                                                <span className="corr-summary-item__badge" style={{ borderColor: SEV_COLOR[to?.severity ?? "LOW"] }}>
                                                    #{edge.toId}
                                                </span>
                                                <span className="corr-summary-item__name">{to?.title ?? "Unknown"}</span>
                                            </div>
                                            <button className="det-corr-item__del" onClick={() => { removeEdge(edge.id); refreshEdges(); }}>✕</button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="corr-modal__actions">
                            <button className="inc-btn inc-btn--ghost" onClick={() => setShowSummary(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}