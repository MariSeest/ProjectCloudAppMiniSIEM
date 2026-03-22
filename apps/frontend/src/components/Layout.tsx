import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import { useTheme } from '../context/ThemeContext'

const NAV = [
    { to: '/', icon: '◈', label: 'Dashboard', exact: true },
    { to: '/events', icon: '⚡', label: 'Events' },
    { to: '/alerts', icon: '🔔', label: 'Alerts' },
    { to: '/incidents', icon: '🚨', label: 'Incidents' },
    { to: '/correlate', icon: '⬡', label: 'Correlations' },
    { to: '/cves', icon: '🔍', label: 'CVEs' },
]

const SECURITY = [
    { to: '/falxdr', icon: '🛡️', label: 'FALXDR Endpoints' },
    { to: '/discovery', icon: '📡', label: 'Asset Discovery' },
    { to: '/identity', icon: '🔑', label: 'Identity Mgmt' },
]

const MGMT = [
    { to: '/acn', icon: '📋', label: 'ACN Reports' },
    { to: '/audit', icon: '📜', label: 'Audit Log' },
    { to: '/tickets/archived', icon: '🗃️', label: 'Archived Tickets' },
    { to: '/users', icon: '👥', label: 'User Management' },
]

export default function Layout({ children }: { children: ReactNode }) {
    const { user, logout, activeTenantId, setActiveTenantId } = useAuth()
    const { theme, toggle } = useTheme()
    const location = useLocation()
    const navigate = useNavigate()

    const isLoginPage = location.pathname.includes('/login')
    if (isLoginPage || !user) return <>{children}</>

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="topbar__left">
                    <div className="brand">
                        <div className="brand__logo">M</div>
                        <span className="brand__name">MiniSIEM</span>
                    </div>
                    {user.role === 'ADMIN' && (
                        <div className="tenant-select-wrap">
                            <label>Tenant:</label>
                            <select
                                className="tenant-select"
                                value={activeTenantId || ''}
                                onChange={(e) => setActiveTenantId(e.target.value)}
                            >
                                <option value="00000000-0000-0000-0000-000000000001">Admin Tenant</option>
                                <option value="00000000-0000-0000-0000-000000000002">Azienda Cliente</option>
                            </select>
                        </div>
                    )}
                </div>
                <div className="topbar__right">
                    <button className="theme-btn" onClick={toggle} title="Toggle theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <div className="user-pill">
                        <div className="user-pill__avatar">
                            {(user.fullName || user.username)[0].toUpperCase()}
                        </div>
                        <div className="user-pill__meta">
                            <span className="user-pill__name">{user.fullName || user.username}</span>
                            <span className="user-pill__role">{user.role}</span>
                        </div>
                    </div>
                    <button
                        className="btn-logout"
                        onClick={() => {
                            logout()
                            navigate('/login')
                        }}
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="main">
                <nav className="sidenav">
                    {NAV.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                        >
                            <span className="nav-link__icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="nav-section">
                        <span className="nav-section-label">Security</span>
                    </div>
                    {SECURITY.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                        >
                            <span className="nav-link__icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}

                    <div className="nav-section">
                        <span className="nav-section-label">Management</span>
                    </div>
                    {MGMT.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-link${isActive ? ' nav-link--active' : ''}`}
                        >
                            <span className="nav-link__icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <main className="content">{children}</main>
            </div>
        </div>
    )
}