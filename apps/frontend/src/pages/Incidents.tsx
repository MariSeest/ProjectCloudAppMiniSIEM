import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createIncident, listIncidents } from "../api/incidents";
import type { Incident, IncidentSeverity } from "../models/incident";
import { getEdgesForIncident } from "../models/correlation";
import SeverityBadge from "../components/SeverityBadge";
import "../styles/incidents.css";

const severities: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Incidents() {
    const navigate = useNavigate();
    const [items, setItems]       = useState<Incident[]>([]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [success, setSuccess]   = useState<string | null>(null);

    const [title, setTitle]             = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity]       = useState<IncidentSeverity>("HIGH");
    const [cves, setCves]               = useState("");

    const sorted = useMemo(() =>
            [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
        [items]);

    async function load() {
        try {
            setLoading(true); setError(null);
            setItems(await listIncidents());
        } catch (e: any) { setError(e?.message ?? "Failed to load"); }
        finally { setLoading(false); }
    }

    useEffect(() => { void load(); }, []);

    async function onCreate() {
        if (!title.trim()) return;
        try {
            setLoading(true); setError(null); setSuccess(null);
            const cveIds = cves.split(",").map(s => s.trim()).filter(Boolean);
            await createIncident({ title, description: description || undefined, severity, cveIds: cveIds.length ? cveIds : undefined });
            setTitle(""); setDescription("");
            setSuccess("Incident created.");
            await load();
        } catch (e: any) { setError(e?.message ?? "Failed to create"); }
        finally { setLoading(false); }
    }

    return (
        <div className="inc-page">
            <div className="inc-header">
                <div>
                    <h1 className="inc-title">Incidents</h1>
                    <p className="inc-subtitle">Track, correlate and investigate security incidents.</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="inc-btn inc-btn--accent" onClick={() => navigate("/correlate")}>
                        ⬡ Correlation Workspace
                    </button>
                    <button className="inc-btn inc-btn--ghost" onClick={() => void load()} disabled={loading}>
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {error   && <div className="inc-alert inc-alert--error">{error}</div>}
            {success && <div className="inc-alert inc-alert--success">{success}</div>}

            {/* Form */}
            <div className="inc-card">
                <div className="inc-card__head">
                    <span className="inc-card__title">New Incident</span>
                    <span className="inc-card__badge">+ Create</span>
                </div>
                <div className="inc-form">
                    <div className="inc-form__row">
                        <label className="inc-field">
                            <span className="inc-field__label">Title</span>
                            <input className="inc-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Suspicious Vulnerability Detected" />
                        </label>
                        <label className="inc-field">
                            <span className="inc-field__label">Severity</span>
                            <select className="inc-select" value={severity} onChange={e => setSeverity(e.target.value as IncidentSeverity)}>
                                {severities.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </label>
                    </div>
                    <label className="inc-field">
                        <span className="inc-field__label">Description</span>
                        <textarea className="inc-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Investigate exposure..." rows={3} />
                    </label>
                    <label className="inc-field">
                        <span className="inc-field__label">CVE IDs (comma separated)</span>
                        <input className="inc-input" value={cves} onChange={e => setCves(e.target.value)} placeholder="CVE-2024-39174, CVE-2022-1234" />
                    </label>
                    <div className="inc-form__actions">
                        <button className="inc-btn inc-btn--primary" onClick={onCreate} disabled={loading || !title.trim()}>
                            Create Incident
                        </button>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="inc-card">
                <div className="inc-card__head">
                    <span className="inc-card__title">All Incidents</span>
                    <span className="inc-card__count">{sorted.length} total</span>
                </div>

                <div className="inc-table">
                    <div className="inc-table__head">
                        <div>Title</div>
                        <div>Severity</div>
                        <div>Status</div>
                        <div>CVEs</div>
                        <div>Correlations</div>
                        <div>Created</div>
                        <div>Actions</div>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="inc-table__empty">No incidents found.</div>
                    ) : sorted.map(i => {
                        const edges = getEdgesForIncident(String(i.id));
                        return (
                            <div key={i.id} className="inc-table__row">
                                <div className="inc-table__cell">
                                    <div className="inc-incident__title">{i.title}</div>
                                    <div className="inc-incident__id">#{i.id}</div>
                                </div>
                                <div className="inc-table__cell"><SeverityBadge severity={i.severity} /></div>
                                <div className="inc-table__cell">
                                    <span className={`inc-status inc-status--${i.status.toLowerCase()}`}>{i.status}</span>
                                </div>
                                <div className="inc-table__cell inc-table__cell--cves">
                                    {(i.cveIds ?? []).length > 0
                                        ? (i.cveIds ?? []).map(c => <span key={c} className="inc-cve-tag">{c}</span>)
                                        : <span className="inc-none">—</span>}
                                </div>
                                <div className="inc-table__cell">
                                    {edges.length > 0
                                        ? <span className="inc-corr-badge">🔗 {edges.length} correlation{edges.length > 1 ? "s" : ""}</span>
                                        : <span className="inc-none">—</span>}
                                </div>
                                <div className="inc-table__cell inc-table__cell--date">
                                    {new Date(i.createdAt).toLocaleString()}
                                </div>
                                <div className="inc-table__cell inc-table__cell--actions">
                                    <button className="inc-btn inc-btn--xs" onClick={() => navigate(`/incidents/${i.id}`)}>
                                        Open
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}