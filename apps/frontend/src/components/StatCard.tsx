type Props = { title: string; value: number; subtitle?: string };

export default function StatCard({ title, value, subtitle }: Props) {
    return (
        <div style={{ border: "1px solid #e5e5e5", borderRadius: 12, padding: 16, background: "#fafafa", minWidth: 220 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{title}</div>
            <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>{value}</div>
            {subtitle ? <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>{subtitle}</div> : null}
        </div>
    );
}
