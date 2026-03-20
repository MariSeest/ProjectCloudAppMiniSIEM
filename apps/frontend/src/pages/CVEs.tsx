import { useEffect, useMemo, useState } from "react";
import type { Cve } from "../models/cve";
import { listCves } from "../api/cves";
import SeverityBadge from "../components/SeverityBadge";
import "../styles/CVEs.css";

export default function CVEs() {
    const [query, setQuery] = useState("CVE");
    const [limit, setLimit] = useState<number>(10);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<Cve[]>([]);

    async function load() {
        try {
            setLoading(true);
            setError(null);
            const data = await listCves({ query, limit });
            setItems(data);
        } catch (e: any) {
            setError(e?.message ?? "Failed to load CVEs");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            await load();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const count = useMemo(() => items.length, [items]);

    return (
        <div className="cvesPage">
            <div className="cvesHeader">
                <div>
                    <h1>CVEs</h1>
                    <p>Search vulnerabilities from OpenCTI via backend.</p>
                </div>

                <div className="cvesControls">
                    <input
                        className="cvesInput"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search (e.g., CVE-2024)"
                    />

                    <select
                        className="cvesSelect"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value) || 10)}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                    </select>

                    <button className="cvesButton" onClick={() => void load()} disabled={loading}>
                        {loading ? "Loading..." : "Search"}
                    </button>
                </div>
            </div>

            {error && <div className="cvesError">{error}</div>}

            <div className="cvesMeta">
                <span>Results: {count}</span>
            </div>

            <div className="cvesTableWrap">
                <table className="cvesTable">
                    <thead>
                    <tr>
                        <th>CVE</th>
                        <th>Severity</th>
                        <th>Score</th>
                        <th>Description</th>
                        <th>External</th>
                    </tr>
                    </thead>
                    <tbody>
                    {items.map((c) => (
                        <tr key={c.cveId}>
                            <td className="mono">{c.cveId}</td>
                            <td>
                                <SeverityBadge severity={c.severity} />
                            </td>
                            <td className="mono">{c.score ?? "-"}</td>
                            <td className="desc">{c.description || "-"}</td>
                            <td>
                                {c.externalUrl ? (
                                    <a className="cvesLink" href={c.externalUrl} target="_blank" rel="noreferrer">
                                        Open
                                    </a>
                                ) : (
                                    "-"
                                )}
                            </td>
                        </tr>
                    ))}

                    {!loading && items.length === 0 && (
                        <tr>
                            <td colSpan={5} className="empty">
                                No results.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
