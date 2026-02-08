import type { Incident } from "../models/incident";
import { apiFetch } from "./client";

export type CreateIncidentPayload = {
    title: string;
    description?: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    cveIds?: string[];
};

export function listIncidents(): Promise<Incident[]> {
    return apiFetch<Incident[]>("/api/incidents");
}

export function createIncident(payload: CreateIncidentPayload): Promise<Incident> {
    return apiFetch<Incident>("/api/incidents", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
