import type { Incident } from "../models/incident";

const now = new Date();
const iso = (d: Date): string => d.toISOString();

export const mockIncidents: Incident[] = [
    {
        id: 3001,
        title: "Domain compromise suspected",
        description: "Potential domain-wide compromise under investigation.",
        severity: "CRITICAL",
        status: "IN_PROGRESS",
        cveIds: ["CVE-2024-3400"],
        createdAt: iso(new Date(now.getTime() - 6 * 60 * 60 * 1000)),
        updatedAt: iso(new Date(now.getTime() - 5 * 60 * 60 * 1000)),
    },
    {
        id: 3002,
        title: "Suspicious outbound traffic",
        description: "Unusual outbound communication detected from an internal host.",
        severity: "HIGH",
        status: "OPEN",
        cveIds: ["CVE-2023-4966"],
        createdAt: iso(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
        updatedAt: iso(new Date(now.getTime() - 90 * 60 * 1000)),
    },
];