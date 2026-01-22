type SeverityBadgeProps = {
    severity: number; // 1..10
};

function getLabel(sev: number) {
    if (sev >= 9) return "CRITICAL";
    if (sev >= 7) return "HIGH";
    if (sev >= 4) return "MEDIUM";
    return "LOW";
}

function getClassName(sev: number) {
    if (sev >= 9) return "badge badge--critical";
    if (sev >= 7) return "badge badge--high";
    if (sev >= 4) return "badge badge--medium";
    return "badge badge--low";
}

export default function SeverityBadge({ severity }: SeverityBadgeProps) {
    const label = getLabel(severity);
    const cls = getClassName(severity);

    return <span className={cls}>{label} ({severity})</span>;
}
