import { mockIncidents } from "../mock/incidents";
import SeverityBadge from "../components/SeverityBadge";

export default function Incidents() {
    return (
        <div>
            <h1 className="page-title">Incidents</h1>
            <p className="page-subtitle">Incident workflow and investigations.</p>

            <table className="table">
                <thead>
                <tr>
                    <th>Created</th>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Assignee</th>
                    <th>Severity</th>
                </tr>
                </thead>
                <tbody>
                {mockIncidents.map((i) => (
                    <tr key={i.id}>
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
