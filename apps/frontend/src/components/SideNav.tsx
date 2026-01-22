import { NavLink } from "react-router-dom";

function navClass(isActive: boolean) {
    return isActive ? "nav-link nav-link--active" : "nav-link";
}

export default function SideNav() {
    return (
        <aside className="sidenav">
            <div className="nav-group">
                <NavLink to="/" end className={({ isActive }) => navClass(isActive)}>
                    Dashboard
                </NavLink>
                <NavLink to="/events" className={({ isActive }) => navClass(isActive)}>
                    Events
                </NavLink>
                <NavLink to="/alerts" className={({ isActive }) => navClass(isActive)}>
                    Alerts
                </NavLink>
                <NavLink to="/incidents" className={({ isActive }) => navClass(isActive)}>
                    Incidents
                </NavLink>
            </div>
        </aside>
    );
}
