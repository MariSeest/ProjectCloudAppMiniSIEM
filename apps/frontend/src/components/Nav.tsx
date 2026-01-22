import { NavLink } from "react-router-dom";

const baseLink: React.CSSProperties = {
    padding: "10px 12px",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 14,
};

export default function Nav() {
    return (
        <nav
            style={{
                display: "flex",
                gap: 8,
                padding: 12,
                borderBottom: "1px solid #eee",
                alignItems: "center",
            }}
        >
            <div style={{ fontWeight: 700, marginRight: 12 }}>MiniSIEM</div>

            <NavLink
                to="/"
                end
                style={({ isActive }) => ({
                    ...baseLink,
                    color: isActive ? "white" : "#111",
                    background: isActive ? "#111" : "transparent",
                })}
            >
                Dashboard
            </NavLink>

            <NavLink
                to="/events"
                style={({ isActive }) => ({
                    ...baseLink,
                    color: isActive ? "white" : "#111",
                    background: isActive ? "#111" : "transparent",
                })}
            >
                Events
            </NavLink>

            <NavLink
                to="/alerts"
                style={({ isActive }) => ({
                    ...baseLink,
                    color: isActive ? "white" : "#111",
                    background: isActive ? "#111" : "transparent",
                })}
            >
                Alerts
            </NavLink>

            <NavLink
                to="/incidents"
                style={({ isActive }) => ({
                    ...baseLink,
                    color: isActive ? "white" : "#111",
                    background: isActive ? "#111" : "transparent",
                })}
            >
                Incidents
            </NavLink>

            {/* ✅ CVEs */}
            <NavLink
                to="/cves"
                style={({ isActive }) => ({
                    ...baseLink,
                    color: isActive ? "white" : "#111",
                    background: isActive ? "#111" : "transparent",
                })}
            >
                CVEs
            </NavLink>
        </nav>
    );
}
