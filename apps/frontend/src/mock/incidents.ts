import type { Incident } from "../models/incident";

const now = new Date();
const iso = (d: Date): string => d.toISOString();

export const mockIncidents: Incident[] = [
    {
        id: "i-3001",
        title: "Domain compromise suspected",
        severity: 9,
        status: "INVESTIGATING",
        createdAt: iso(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
        assignee: "SOC-1",
    },
    {
        id: "i-3002",
        title: "Suspicious outbound traffic",
        severity: 6,
        status: "OPEN",
        createdAt: iso(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        assignee: "SOC-2",
    },
];
