const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function handle<T>(res: Response, path: string): Promise<T> {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} - ${path} - ${text}`);
    }
    if (res.status === 204) return null as unknown as T;
    return (await res.json()) as T;
}

export async function httpGet<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
    });
    return handle<T>(res, path);
}

export async function httpPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    return handle<T>(res, path);
}
