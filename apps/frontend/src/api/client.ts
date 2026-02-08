export const API_BASE =
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.VITE_BACKEND_URL ??
    "http://localhost:8080";

export async function apiFetch<T>(input: string | URL, init?: RequestInit): Promise<T> {
    const url =
        input instanceof URL
            ? input
            : input.startsWith("http")
                ? new URL(input)
                : new URL(input, API_BASE);

    const res = await fetch(url.toString(), {
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

    // Se un endpoint risponde 204 No Content
    if (res.status === 204) return undefined as T;

    return (await res.json()) as T;
}
