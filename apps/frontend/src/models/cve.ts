export type Cve = {
    cveId: string;
    description: string;
    severity: string;      // "UNKNOWN" o simili dal backend
    score: number | null;  // nel tuo output è null
    created?: string | null;
    modified?: string | null;
    externalUrl?: string | null;
};
