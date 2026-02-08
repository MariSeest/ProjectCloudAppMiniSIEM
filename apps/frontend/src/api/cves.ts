import type { Cve } from "../models/cve";
import { apiFetch } from "./client";

export async function listCves(params: { query?: string; limit?: number }): Promise<Cve[]> {
    const query = params.query ?? "";
    const limit = params.limit ?? 10;

    const url = new URL("/api/cves", "http://dummy"); // base dummy, poi passiamo URL a apiFetch
    if (query.trim().length > 0) url.searchParams.set("query", query.trim());
    url.searchParams.set("limit", String(limit));

    // apiFetch accetta URL e lo “ri-basa” su API_BASE
    return apiFetch<Cve[]>(new URL(url.pathname + url.search, ""));
}
