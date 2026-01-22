type StatCardProps = {
    title: string;
    value: number;
    subtitle?: string;
};

export default function StatCard({ title, value, subtitle }: StatCardProps) {
    return (
        <div className="card stat-card">
            <div className="stat-card__title">{title}</div>
            <div className="stat-card__value">{value}</div>
            {subtitle ? <div className="stat-card__subtitle">{subtitle}</div> : null}
        </div>
    );
}
