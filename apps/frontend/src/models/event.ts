export type EventCategory = "AUTH" | "PROCESS" | "NETWORK" | "SYSTEM";

export interface NormalizedEvent {
    id: string;
    eventTime: string;     // ISO
    receivedAt: string;    // ISO
    category: EventCategory;
    action: string;
    severity: number;      // 1..10
    host: string;
    user?: string;
    srcIp?: string;
    dstIp?: string;
    processName?: string;
    message: string;
}
