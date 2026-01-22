import type { Cve } from "../models/cve";

const BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8080";

export async function listCves(params: { query?: string; limit?: number }): Promise<Cve[]> {
    const query = params.query ?? "";
    const limit = params.limit ?? 10;

    const url = new URL("/api/cves", BASE_URL);
    if (query.trim().length > 0) url.searchParams.set("query", query.trim());
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { Accept: "application/json" },
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status}: ${txt || res.statusText}`);
    }

    return (await res.json()) as Cve[];
}
