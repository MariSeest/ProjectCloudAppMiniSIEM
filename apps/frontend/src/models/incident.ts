export type IncidentStatus = "OPEN" | "INVESTIGATING" | "CONTAINED" | "CLOSED";

export interface Incident {
    id: string;
    title: string;
    severity: number;        // 1..10
    status: IncidentStatus;
    createdAt: string;       // ISO
    assignee?: string;
}
