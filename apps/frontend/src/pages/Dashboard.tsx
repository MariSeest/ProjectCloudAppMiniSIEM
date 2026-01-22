import StatCard from "../components/StatCard";
import { mockEvents } from "../mock/events";
import { mockAlerts } from "../mock/alerts";
import { mockIncidents } from "../mock/incidents";

export default function Dashboard() {
    const openAlerts = mockAlerts.filter(a => a.status === "OPEN").length;
    const openIncidents = mockIncidents.filter(i => i.status !== "CLOSED").length;

    return (
        <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Overview of ingested events, alerts and active incidents.</p>

            <div className="card-grid">
                <StatCard title="Events (last 24h)" value={mockEvents.length} subtitle="Normalized events ingested" />
                <StatCard title="Open Alerts" value={openAlerts} subtitle="Require triage" />
                <StatCard title="Open Incidents" value={openIncidents} subtitle="Active investigations" />
            </div>
        </div>
    );
}
