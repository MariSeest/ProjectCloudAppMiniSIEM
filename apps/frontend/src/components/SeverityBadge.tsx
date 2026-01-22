type Props = {
    severity: number | string;
};

export default function SeverityBadge({ severity }: Props) {
    let label = "";
    let level = 0;

    if (typeof severity === "number") {
        level = severity;
        if (severity >= 8) label = "CRITICAL";
        else if (severity >= 6) label = "HIGH";
        else if (severity >= 4) label = "MEDIUM";
        else label = "LOW";
    } else {
        label = severity.toUpperCase();
        if (label === "CRITICAL") level = 9;
        else if (label === "HIGH") level = 7;
        else if (label === "MEDIUM") level = 5;
        else if (label === "LOW") level = 3;
        else level = 1; // UNKNOWN
    }

    return (
        <span className={`severity sev-${label.toLowerCase()}`}>
      {label} {typeof severity === "number" && `(${level})`}
    </span>
    );
}
