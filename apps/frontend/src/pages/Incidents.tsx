import { mockIncidents } from "../mock/incidents";
import SeverityBadge from "../components/SeverityBadge";

export default function Incidents() {
    return (
        <div>
            <h1>Incidents</h1>

            <table width="100%" cellPadding={10} style={{ borderCollapse: "collapse" }}>
                <thead>
                <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                    <th>Created</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Severity</th>
                </tr>
                </thead>
                <tbody>
                {mockIncidents.map(i => (
                    <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td>{new Date(i.createdAt).toLocaleString()}</td>
                        <td>{i.title}</td>
                        <td><b>{i.status}</b></td>
                        <td>{i.assignee || "-"}</td>
                        <td><SeverityBadge severity={i.severity} /></td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
