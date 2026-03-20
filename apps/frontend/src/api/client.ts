const RAW_BASE =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_BACKEND_URL ??
    "http://localhost:8080";

// ✅ FIX: se il base è relativo (es. "/api"), costruiamo l'URL assoluto
//         combinando origin + BASE_URL (es. /group-5/) + RAW_BASE (es. /api)
//         risultato: https://130.192.100.243/group-5/api
export const API_BASE = RAW_BASE.startsWith("http")
    ? RAW_BASE
    : window.location.origin
    + import.meta.env.BASE_URL.replace(/\/$/, "")   // /group-5
    + RAW_BASE;                                       // /api
// → https://130.192.100.243/group-5/api

export async function apiFetch<T>(input: string | URL, init?: RequestInit): Promise<T> {
    let url: string;

    if (input instanceof URL) {
        url = input.toString();
    } else if (input.startsWith("http")) {
        url = input;
    } else {
        // ✅ FIX: concatenazione diretta invece di new URL()
        // /api/incidents → https://130.192.100.243/group-5/api/incidents
        const path = input.startsWith("/api") ? input : "/api" + input;
        url = API_BASE.replace(/\/api$/, "") + path;
    }

    const res = await fetch(url, {
        headers: {
            Accept: "application/json",
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
            ...(init?.headers ?? {}),
        },
        ...init,
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Backend error ${res.status}: ${txt || res.statusText}`);
    }

    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
}