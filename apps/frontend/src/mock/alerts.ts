import type { Alert } from "../models/alert";

const now = new Date();
const iso = (d: Date): string => d.toISOString();

export const mockAlerts: Alert[] = [
    {
        id: "a-2001",
        title: "Brute force detected",
        severity: 8,
        status: "OPEN",
        createdAt: iso(new Date(now.getTime() - 15 * 60 * 1000)),
        sourceRule: "BF-LOGIN-5IN5",
    },
    {
        id: "a-2002",
        title: "Suspicious PowerShell execution",
        severity: 9,
        status: "OPEN",
        createdAt: iso(new Date(now.getTime() - 40 * 60 * 1000)),
        sourceRule: "PROC-PS-ENC",
    },
    {
        id: "a-2003",
        title: "Port scan activity",
        severity: 6,
        status: "ACK",
        createdAt: iso(new Date(now.getTime() - 120 * 60 * 1000)),
        sourceRule: "NET-PSCAN",
    },
    {
        id: "a-2004",
        title: "Outbound DNS anomaly",
        severity: 5,
        status: "CLOSED",
        createdAt: iso(new Date(now.getTime() - 300 * 60 * 1000)),
        sourceRule: "DNS-ANOM",
    },
];
