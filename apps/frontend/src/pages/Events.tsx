import { useMemo, useState } from "react";
import { mockEvents } from "../mock/events";
import SeverityBadge from "../components/SeverityBadge";
import type { EventCategory, NormalizedEvent } from "../models/event";

function uniqueHosts(events: NormalizedEvent[]): string[] {
    return Array.from(new Set(events.map((e) => e.host))).sort();
}

export default function Events() {
    const [minSeverity, setMinSeverity] = useState<number>(1);
    const [category, setCategory] = useState<EventCategory | "ALL">("ALL");
    const [host, setHost] = useState<string>("ALL");

    const hosts = useMemo(() => uniqueHosts(mockEvents), []);

    const filtered = useMemo(() => {
        return mockEvents.filter(
            (e) =>
                e.severity >= minSeverity &&
                (category === "ALL" || e.category === category) &&
                (host === "ALL" || e.host === host)
        );
    }, [minSeverity, category, host]);

    return (
        <div>
            <h1 className="page-title">Events</h1>
            <p className="page-subtitle">Normalized security events.</p>

            <div className="filters">
                <label>
                    Min severity:&nbsp;
                    <select className="select" value={minSeverity} onChange={(e) => setMinSeverity(Number(e.target.value))}>
                        {[1,2,3,4,5,6,7,8,9].map(v => <option key={v} value={v}>{v}+</option>)}
                    </select>
                </label>

                <label>
                    Category:&nbsp;
                    <select className="select" value={category} onChange={(e) => setCategory(e.target.value as any)}>
                        <option value="ALL">ALL</option>
                        <option value="AUTH">AUTH</option>
                        <option value="PROCESS">PROCESS</option>
                        <option value="NETWORK">NETWORK</option>
                        <option value="SYSTEM">SYSTEM</option>
                    </select>
                </label>

                <label>
                    Host:&nbsp;
                    <select className="select" value={host} onChange={(e) => setHost(e.target.value)}>
                        <option value="ALL">ALL</option>
                        {hosts.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                </label>
            </div>

            <table className="table">
                <thead>
                <tr>
                    <th>Time</th>
                    <th>Category</th>
                    <th>Action</th>
                    <th>Severity</th>
                    <th>Host</th>
                    <th>User</th>
                    <th>Src IP</th>
                    <th>Dst IP</th>
                    <th>Message</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map((e) => (
                    <tr key={e.id}>
                        <td>{new Date(e.eventTime).toLocaleString()}</td>
                        <td>{e.category}</td>
                        <td>{e.action}</td>
                        <td><SeverityBadge severity={e.severity} /></td>
                        <td>{e.host}</td>
                        <td>{e.user || "-"}</td>
                        <td>{e.srcIp || "-"}</td>
                        <td>{e.dstIp || "-"}</td>
                        <td>{e.message}</td>
                    </tr>
                ))}
                {filtered.length === 0 ? (
                    <tr>
                        <td colSpan={9} style={{ color: "var(--muted)" }}>
                            No events match the current filters.
                        </td>
                    </tr>
                ) : null}
                </tbody>
            </table>
        </div>
    );
}
