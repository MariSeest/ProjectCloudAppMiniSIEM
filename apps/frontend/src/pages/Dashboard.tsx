import StatCard from "../components/StatCard";
import { mockEvents } from "../mock/events";
import { mockAlerts } from "../mock/alerts";
import { mockIncidents } from "../mock/incidents";

export default function Dashboard() {
    const openAlerts = mockAlerts.filter(a => a.status === "OPEN").length;
    const openIncidents = mockIncidents.filter(i => i.status !== "CLOSED").length;

    return (
        <div>
            <h1 style={{ marginTop: 0 }}>Dashboard</h1>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
                <StatCard title="Events (last 24h)" value={mockEvents.length} subtitle="Normalized events ingested" />
                <StatCard title="Open Alerts" value={openAlerts} subtitle="Require triage" />
                <StatCard title="Open Incidents" value={openIncidents} subtitle="Active investigations" />
            </div>
        </div>
    );
}
