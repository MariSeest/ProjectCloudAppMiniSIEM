import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { listIncidents } from "../api/incidents";
import type { Incident } from "../models/incident";
import {
    getEdgesForIncident, removeEdge,
    getNotes, addNote, deleteNote,
    type CorrelationEdge, type CorrelationNote
} from "../models/correlation";
import SeverityBadge from "../components/SeverityBadge";
import "../styles/incidents.css";
import "../styles/incident-detail.css";

export default function IncidentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [incident, setIncident]   = useState<Incident | null>(null);
    const [allInc, setAllInc]       = useState<Incident[]>([]);
    const [edges, setEdges]         = useState<CorrelationEdge[]>([]);
    const [notes, setNotes]         = useState<CorrelationNote[]>([]);
    const [noteText, setNoteText]   = useState("");
    const [loading, setLoading]     = useState(true);

    useEffect(() => {
        listIncidents().then(data => {
            setAllInc(data);
            const found = data.find(i => String(i.id) === id);
            setIncident(found ?? null);
            setEdges(getEdgesForIncident(id!));
            setNotes(getNotes(id!));
            setLoading(false);
        });
    }, [id]);

    function refreshCorr() {
        setEdges(getEdgesForIncident(id!));
    }

    function handleDeleteEdge(eid: string) {
        removeEdge(eid);
        refreshCorr();
    }

    function handleAddNote() {
        if (!noteText.trim()) return;
        addNote(id!, noteText);
        setNotes(getNotes(id!));
        setNoteText("");
    }

    function handleDeleteNote(nid: string) {
        deleteNote(nid);
        setNotes(getNotes(id!));
    }

    // Trova incident correlati
    const correlatedIncidents = edges.map(edge => {
        const otherId = edge.fromId === id ? edge.toId : edge.fromId;
        const other = allInc.find(i => String(i.id) === otherId);
        return { edge, other };
    });

    if (loading) return <div className="det-loading">Loading...</div>;
    if (!incident) return <div className="det-loading">Incident not found.</div>;

    return (
        <div className="det-page">
            {/* Breadcrumb */}
            <div className="det-breadcrumb">
                <button className="inc-btn inc-btn--ghost det-back" onClick={() => navigate("/incidents")}>
                    ← Incidents
                </button>
                <span className="det-breadcrumb__sep">/</span>
                <span className="det-breadcrumb__current">#{incident.id} · {incident.title}</span>
            </div>

            {/* Header */}
            <div className="det-header">
                <div className="det-header__left">
                    <h1 className="det-title">{incident.title}</h1>
                    <div className="det-meta">
                        <SeverityBadge severity={incident.severity} />
                        <span className={`inc-status inc-status--${incident.status.toLowerCase()}`}>{incident.status}</span>
                        <span className="det-id">#{incident.id}</span>
                        <span className="det-date">Created {new Date(incident.createdAt).toLocaleString()}</span>
                    </div>
                </div>
                <button className="inc-btn inc-btn--accent" onClick={() => navigate("/correlate")}>
                    ⬡ Correlation Workspace
                </button>
            </div>

            <div className="det-grid">
                {/* Left column */}
                <div className="det-col">
                    {/* Description */}
                    <div className="inc-card">
                        <div className="inc-card__head">
                            <span className="inc-card__title">Description</span>
                        </div>
                        <div className="det-description">
                            {incident.description || <span className="inc-none">No description provided.</span>}
                        </div>
                    </div>

                    {/* CVEs */}
                    <div className="inc-card">
                        <div className="inc-card__head">
                            <span className="inc-card__title">CVE References</span>
                            <span className="inc-card__count">{(incident.cveIds ?? []).length}</span>
                        </div>
                        <div className="det-cves">
                            {(incident.cveIds ?? []).length > 0
                                ? (incident.cveIds ?? []).map(c => (
                                    <a key={c} className="inc-cve-tag det-cve-link"
                                       href={`https://nvd.nist.gov/vuln/detail/${c}`}
                                       target="_blank" rel="noreferrer">
                                        🔍 {c}
                                    </a>
                                ))
                                : <span className="inc-none">No CVEs linked.</span>}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="inc-card">
                        <div className="inc-card__head">
                            <span className="inc-card__title">Investigation Notes</span>
                            <span className="inc-card__count">{notes.length}</span>
                        </div>
                        <div className="det-notes">
                            {notes.length === 0 && (
                                <p className="inc-none" style={{ padding: "12px 0" }}>No notes yet. Add your first note below.</p>
                            )}
                            {notes.map(n => (
                                <div key={n.id} className="det-note">
                                    <div className="det-note__text">{n.text}</div>
                                    <div className="det-note__footer">
                                        <span className="det-note__date">{new Date(n.createdAt).toLocaleString()}</span>
                                        <button className="det-note__del" onClick={() => handleDeleteNote(n.id)}>✕</button>
                                    </div>
                                </div>
                            ))}
                            <div className="det-note-form">
                                <textarea
                                    className="inc-textarea"
                                    value={noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    placeholder="Add investigation note..."
                                    rows={3}
                                />
                                <button className="inc-btn inc-btn--primary" onClick={handleAddNote} disabled={!noteText.trim()}>
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="det-col">
                    {/* Correlations */}
                    <div className="inc-card">
                        <div className="inc-card__head">
                            <span className="inc-card__title">Correlations</span>
                            <span className="inc-card__count">{correlatedIncidents.length}</span>
                        </div>
                        <div className="det-corrs">
                            {correlatedIncidents.length === 0 ? (
                                <div className="det-corr-empty">
                                    <p>No correlations yet.</p>
                                    <button className="inc-btn inc-btn--accent" onClick={() => navigate("/correlate")}>
                                        Open Workspace →
                                    </button>
                                </div>
                            ) : correlatedIncidents.map(({ edge, other }) => (
                                <div key={edge.id} className="det-corr-item">
                                    <div className="det-corr-item__icon">🔗</div>
                                    <div className="det-corr-item__body">
                                        <div className="det-corr-item__dir">
                                            {edge.fromId === id ? "correlates to →" : "← correlated from"}
                                        </div>
                                        {other ? (
                                            <Link to={`/incidents/${other.id}`} className="det-corr-item__link">
                                                #{other.id} · {other.title}
                                            </Link>
                                        ) : (
                                            <span className="inc-none">Incident #{edge.fromId === id ? edge.toId : edge.fromId}</span>
                                        )}
                                        {edge.label && <div className="det-corr-item__label">"{edge.label}"</div>}
                                    </div>
                                    <button className="det-corr-item__del" onClick={() => handleDeleteEdge(edge.id)}>✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info panel */}
                    <div className="inc-card">
                        <div className="inc-card__head">
                            <span className="inc-card__title">Incident Info</span>
                        </div>
                        <div className="det-info">
                            <div className="det-info__row">
                                <span className="det-info__label">ID</span>
                                <span className="det-info__value mono">#{incident.id}</span>
                            </div>
                            <div className="det-info__row">
                                <span className="det-info__label">Status</span>
                                <span className={`inc-status inc-status--${incident.status.toLowerCase()}`}>{incident.status}</span>
                            </div>
                            <div className="det-info__row">
                                <span className="det-info__label">Severity</span>
                                <SeverityBadge severity={incident.severity} />
                            </div>
                            <div className="det-info__row">
                                <span className="det-info__label">Created</span>
                                <span className="det-info__value">{new Date(incident.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="det-info__row">
                                <span className="det-info__label">Updated</span>
                                <span className="det-info__value">{new Date(incident.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}