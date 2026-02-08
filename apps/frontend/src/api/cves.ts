import type { Cve } from "../models/cve";
import { apiFetch } from "./client";

export async function listCves(params: { query?: string; limit?: number } = {}): Promise<Cve[]> {
    const query = (params.query ?? "").trim();
    const limit = params.limit ?? 10;

    const qs = new URLSearchParams();
    if (query.length > 0) qs.set("query", query);
    qs.set("limit", String(limit));

    // ✅ stringa relativa: apiFetch la basa su API_BASE (8080)
    return apiFetch<Cve[]>(`/api/cves?${qs.toString()}`);
}
