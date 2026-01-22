import type { NormalizedEvent } from "../models/event";

const now = new Date();
const iso = (d: Date): string => d.toISOString();

export const mockEvents: NormalizedEvent[] = [
    {
        id: "e-1001",
        eventTime: iso(new Date(now.getTime() - 2 * 60 * 1000)),
        receivedAt: iso(new Date(now.getTime() - 1 * 60 * 1000)),
        category: "AUTH",
        action: "login_failed",
        severity: 6,
        host: "WS-01",
        user: "admin",
        srcIp: "10.10.1.23",
        message: "Multiple failed login attempts",
    },
    {
        id: "e-1002",
        eventTime: iso(new Date(now.getTime() - 12 * 60 * 1000)),
        receivedAt: iso(new Date(now.getTime() - 11 * 60 * 1000)),
        category: "PROCESS",
        action: "process_start",
        severity: 9,
        host: "SRV-DC01",
        user: "svc-backup",
        processName: "powershell.exe",
        message: "Suspicious PowerShell execution (encoded command)",
    },
    {
        id: "e-1003",
        eventTime: iso(new Date(now.getTime() - 30 * 60 * 1000)),
        receivedAt: iso(new Date(now.getTime() - 29 * 60 * 1000)),
        category: "NETWORK",
        action: "connection",
        severity: 4,
        host: "FW-EDGE",
        srcIp: "192.168.1.10",
        dstIp: "8.8.8.8",
        message: "Outbound connection detected",
    },
];
