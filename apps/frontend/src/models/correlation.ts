export type CorrelationEdge = {
    id: string;
    fromId: string;
    toId: string;
    label?: string;
    createdAt: string;
};

export type CorrelationNote = {
    id: string;
    incidentId: string;
    text: string;
    createdAt: string;
};

const EDGES_KEY = "minisiem:correlation:edges";
const NOTES_KEY = "minisiem:correlation:notes";

/* ── Edges ── */
export function getEdges(): CorrelationEdge[] {
    try { return JSON.parse(localStorage.getItem(EDGES_KEY) ?? "[]"); }
    catch { return []; }
}

export function addEdge(from: string, to: string, label?: string): CorrelationEdge {
    const edges = getEdges();
    const edge: CorrelationEdge = {
        id: crypto.randomUUID(),
        fromId: from,
        toId: to,
        label: label?.trim() || undefined,
        createdAt: new Date().toISOString(),
    };
    edges.push(edge);
    localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
    return edge;
}

export function removeEdge(id: string): void {
    const edges = getEdges().filter(e => e.id !== id);
    localStorage.setItem(EDGES_KEY, JSON.stringify(edges));
}

export function getEdgesForIncident(incidentId: string): CorrelationEdge[] {
    return getEdges().filter(e => e.fromId === incidentId || e.toId === incidentId);
}

/* ── Notes ── */
export function getNotes(incidentId: string): CorrelationNote[] {
    try {
        const all: CorrelationNote[] = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]");
        return all.filter(n => n.incidentId === incidentId);
    } catch { return []; }
}

export function addNote(incidentId: string, text: string): CorrelationNote {
    const all: CorrelationNote[] = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]");
    const note: CorrelationNote = {
        id: crypto.randomUUID(),
        incidentId,
        text: text.trim(),
        createdAt: new Date().toISOString(),
    };
    all.push(note);
    localStorage.setItem(NOTES_KEY, JSON.stringify(all));
    return note;
}

export function deleteNote(id: string): void {
    const all: CorrelationNote[] = JSON.parse(localStorage.getItem(NOTES_KEY) ?? "[]");
    localStorage.setItem(NOTES_KEY, JSON.stringify(all.filter(n => n.id !== id)));
}