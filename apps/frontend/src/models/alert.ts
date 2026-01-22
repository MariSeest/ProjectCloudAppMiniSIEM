export type AlertStatus = "OPEN" | "ACK" | "CLOSED";

export interface Alert {
    id: string;
    title: string;
    severity: number;     // 1..10
    status: AlertStatus;
    createdAt: string;    // ISO
    sourceRule: string;
}
