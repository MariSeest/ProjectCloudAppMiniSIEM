import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../styles/login.css";

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
        <div className="login-page">
            {/* Sfondo animato */}
            <div className="login-bg">
                {/* Stelle */}
                <div className="stars" />
                <div className="stars stars--2" />
                <div className="stars stars--3" />

                {/* Nebula */}
                <div className="nebula nebula--1" />
                <div className="nebula nebula--2" />
                <div className="nebula nebula--3" />

                {/* Computer/Monitor animati */}
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`floating-monitor monitor--${i + 1}`}>
                        <svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg">
                            {/* Monitor body */}
                            <rect x="5" y="5" width="110" height="70" rx="6"
                                  fill="rgba(6,13,26,0.85)"
                                  stroke="rgba(58,169,255,0.5)"
                                  strokeWidth="1.5" />
                            {/* Screen */}
                            <rect x="12" y="12" width="96" height="56" rx="3"
                                  fill="rgba(10,25,60,0.9)"
                                  stroke="rgba(58,169,255,0.25)"
                                  strokeWidth="0.5" />
                            {/* Screen glow */}
                            <rect x="12" y="12" width="96" height="56" rx="3"
                                  fill="url(#screenGlow)" opacity="0.6" />
                            {/* Scanlines */}
                            {[...Array(7)].map((_, j) => (
                                <line key={j}
                                      x1="12" y1={18 + j * 8}
                                      x2="108" y2={18 + j * 8}
                                      stroke="rgba(58,169,255,0.06)"
                                      strokeWidth="0.5" />
                            ))}
                            {/* Code lines */}
                            <rect x="18" y="18" width={20 + (i % 3) * 15} height="2" rx="1"
                                  fill="rgba(58,169,255,0.7)" />
                            <rect x="18" y="24" width={35 + (i % 4) * 10} height="2" rx="1"
                                  fill="rgba(124,77,255,0.6)" />
                            <rect x="18" y="30" width={15 + (i % 5) * 8} height="2" rx="1"
                                  fill="rgba(0,229,160,0.5)" />
                            <rect x="18" y="36" width={40 + (i % 3) * 12} height="2" rx="1"
                                  fill="rgba(58,169,255,0.4)" />
                            <rect x="18" y="42" width={25 + (i % 4) * 9} height="2" rx="1"
                                  fill="rgba(124,77,255,0.5)" />
                            <rect x="18" y="48" width={30 + (i % 2) * 20} height="2" rx="1"
                                  fill="rgba(58,169,255,0.6)" />
                            <rect x="18" y="54" width={20 + (i % 3) * 11} height="2" rx="1"
                                  fill="rgba(0,229,160,0.4)" />
                            {/* Cursor blink */}
                            <rect x="18" y="60" width="6" height="3" rx="1"
                                  fill="rgba(58,169,255,0.9)"
                                  className="cursor-blink" />
                            {/* Stand */}
                            <rect x="52" y="75" width="16" height="8" rx="2"
                                  fill="rgba(58,169,255,0.3)"
                                  stroke="rgba(58,169,255,0.4)"
                                  strokeWidth="1" />
                            <rect x="42" y="82" width="36" height="3" rx="1.5"
                                  fill="rgba(58,169,255,0.25)"
                                  stroke="rgba(58,169,255,0.35)"
                                  strokeWidth="1" />
                            {/* Corner lights */}
                            <circle cx="9" cy="9" r="1.5" fill="rgba(58,169,255,0.8)" />
                            <circle cx="111" cy="9" r="1.5" fill="rgba(124,77,255,0.8)" />
                            <defs>
                                <radialGradient id="screenGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor="rgba(58,169,255,0.15)" />
                                    <stop offset="100%" stopColor="transparent" />
                                </radialGradient>
                            </defs>
                        </svg>
                    </div>
                ))}

                {/* Particelle fluttuanti */}
                {[...Array(20)].map((_, i) => (
                    <div key={i} className={`particle particle--${(i % 4) + 1}`}
                         style={{
                             left: `${5 + (i * 4.7) % 90}%`,
                             top: `${5 + (i * 7.3) % 90}%`,
                             animationDelay: `${i * 0.4}s`,
                             animationDuration: `${3 + (i % 4)}s`
                         }}
                    />
                ))}

                {/* Grid cyber */}
                <div className="cyber-grid" />
            </div>

            {/* Card login */}
            <div className="login-card">
                <div className="login-card__glow" />

                <div className="login-card__logo">
                    <div className="login-logo-icon" />
                </div>

                <h1 className="login-card__title">MiniSIEM</h1>
                <p className="login-card__subtitle">Security Information & Event Management</p>

                <form onSubmit={onSubmit} className="login-form">
                    <label className="login-field">
                        <span className="login-field__label">Email</span>
                        <input
                            className="login-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            autoComplete="email"
                        />
                    </label>

                    <button className="login-submit" type="submit">
                        <span>Sign In</span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </form>

                <p className="login-card__note">
                    Mock authentication — Auth0 coming soon.
                </p>
            </div>
        </div>
    );
}