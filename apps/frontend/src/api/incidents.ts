import type { Incident } from "../models/incident";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export type CreateIncidentPayload = {
    title: string;
    description?: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    cveIds?: string[];
};

export async function listIncidents(): Promise<Incident[]> {
    const res = await fetch(`${BASE}/api/incidents`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error ${res.status}: ${text}`);
    }
    return res.json();
}

export async function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    const res = await fetch(`${BASE}/api/incidents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend error ${res.status}: ${text}`);
    }
    return res.json();
}
