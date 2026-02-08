import { useEffect, useMemo, useState } from "react";
import { createIncident, listIncidents } from "../api/incidents";
import type { Incident, IncidentSeverity } from "../models/incident";
import SeverityBadge from "../components/SeverityBadge";

import "../styles/pages.css";

const severities: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Incidents() {
    const [items, setItems] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<IncidentSeverity>("HIGH");
    const [cves, setCves] = useState("CVE-2024-39174");

    const sorted = useMemo(() => {
        return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }, [items]);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            const data = await listIncidents();
            setItems(data);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load incidents");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void load();
    }, []);

    async function onCreate() {
        try {
            setLoading(true);
            setError(null);

            const cveIds = cves
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

            await createIncident({
                title,
                description: description || undefined,
                severity,
                cveIds: cveIds.length ? cveIds : undefined,
            });

            setTitle("");
            setDescription("");
            // mantengo cves e severity
            await load();
        } catch (e: any) {
            setError(e?.message ?? "Failed to create incident");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page">
            <div className="page__header">
                <h1 className="page__title">Incidents</h1>
                <p className="page__subtitle">Create and track incidents persisted on MySQL.</p>
            </div>

            {error && <div className="alert alert--error">{error}</div>}

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="card__header">
                    <div className="card__title">New incident</div>
                    <div className="card__subtitle">This will be stored in MySQL via backend.</div>
                </div>

                <div className="form-grid">
                    <label className="field">
                        <span className="field__label">Title</span>
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Suspicious Vulnerability Detected"
                        />
                    </label>

                    <label className="field">
                        <span className="field__label">Severity</span>
                        <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}>
                            {severities.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span className="field__label">Description</span>
                        <textarea
                            className="textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Investigate exposure..."
                            rows={3}
                        />
                    </label>

                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span className="field__label">CVE IDs (comma separated)</span>
                        <input
                            className="input"
                            value={cves}
                            onChange={(e) => setCves(e.target.value)}
                            placeholder="CVE-2024-39174, CVE-2022-1234"
                        />
                    </label>

                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn btn--primary" onClick={onCreate} disabled={loading || !title.trim()}>
                            Create
                        </button>
                        <button className="btn" onClick={() => void load()} disabled={loading}>
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <div className="card__title">Incidents</div>
                    <div className="card__subtitle">{loading ? "Loading..." : `Items: ${sorted.length}`}</div>
                </div>

                <div className="table">
                    <div className="table__row table__row--head">
                        <div>ID</div>
                        <div>Title</div>
                        <div>Severity</div>
                        <div>Status</div>
                        <div>CVEs</div>
                        <div>Created</div>
                    </div>

                    {sorted.length === 0 ? (
                        <div className="table__empty">No incidents.</div>
                    ) : (
                        sorted.map((i) => (
                            <div key={i.id} className="table__row">
                                <div className="mono">{i.id}</div>
                                <div>{i.title}</div>
                                <div>
                                    <SeverityBadge severity={i.severity} />
                                </div>
                                <div className="mono">{i.status}</div>
                                <div className="mono">{(i.cveIds ?? []).join(", ") || "-"}</div>
                                <div className="mono">{new Date(i.createdAt).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
