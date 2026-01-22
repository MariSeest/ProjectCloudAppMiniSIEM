import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("luisa.mele@example.com");

    if (user) return <Navigate to="/" replace />;

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        login(email);
        navigate("/", { replace: true });
    };

    return (
        <div className="center-page">
            <div className="card login-card">
                <h1 className="page-title">Login</h1>
                <p className="page-subtitle">
                    Login mock. In seguito questa pagina verrà sostituita con Auth0.
                </p>

                <form onSubmit={onSubmit}>
                    <div className="form-row">
                        <label>Email</label>
                        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <div className="help">Usiamo l’email solo per popolare il profilo (mock).</div>
                    </div>

                    <button className="btn btn-primary" type="submit">
                        Sign in
                    </button>
                </form>
            </div>
        </div>
    );
}
