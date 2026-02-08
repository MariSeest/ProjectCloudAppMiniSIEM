export type IncidentStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Incident = {
    id: number;
    title: string;
    description?: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    cveIds: string[];
    createdAt: string;
    updatedAt: string;
};
