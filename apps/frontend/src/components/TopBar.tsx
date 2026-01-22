import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function TopBar() {
    const { user, logout } = useAuth();

    return (
        <header className="topbar">
            <div className="topbar__left">
                <div className="brand">
                    <div className="brand__logo" />
                    <div className="brand__name">MiniSIEM</div>
                </div>
            </div>

            <div className="topbar__right">
                {user ? (
                    <>
                        <Link to="/profile" className="btn btn-primary" style={{ textDecoration: "none" }}>
                            Profile
                        </Link>

                        <div className="user-pill" title={user.email}>
                            <div className="user-pill__avatar" />
                            <div className="user-pill__meta">
                                <div className="user-pill__name">{user.name}</div>
                                <div className="user-pill__role">{user.role}</div>
                            </div>
                        </div>

                        <button className="btn" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn btn-primary" style={{ textDecoration: "none" }}>
                        Login
                    </Link>
                )}
            </div>
        </header>
    );
}
