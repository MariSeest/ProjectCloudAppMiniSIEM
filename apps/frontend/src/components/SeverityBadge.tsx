type Props = { severity: number };

function label(sev: number) {
    if (sev >= 9) return "CRITICAL";
    if (sev >= 7) return "HIGH";
    if (sev >= 4) return "MEDIUM";
    return "LOW";
}

export default function SeverityBadge({ severity }: Props) {
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: 999,
            border: "1px solid #ddd",
            background: "#fff",
            fontSize: 12,
            fontWeight: 600
        }}>
      {label(severity)} ({severity})
    </span>
    );
}
