import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Profile() {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div>
            <h1 className="page-title">User Profile</h1>
            <p className="page-subtitle">
                Placeholder per Auth0: qui mostreremo i claim dell’utente autenticato.
            </p>

            <div className="card">
                <div><b>Name:</b> {user.name}</div>
                <div><b>Role:</b> {user.role}</div>
                <div><b>Email:</b> {user.email}</div>
            </div>
        </div>
    );
}
