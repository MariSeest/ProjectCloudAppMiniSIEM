import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await login(username, password)
            navigate('/', { replace: true })
        } catch (err: unknown) {
            setError(typeof err === 'string' ? err : 'Invalid credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="center-page">
            <div className="login-card">
                <div className="login-logo">M</div>
                <h1 className="login-title">MiniSIEM</h1>
                <p className="login-sub">Security Information & Event Management</p>

                {error && (
                    <div className="alert-msg alert-msg--error" style={{ marginBottom: 18 }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="field">
                        <label className="field-label">Username</label>
                        <input
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="admin"
                            autoFocus
                            autoComplete="username"
                        />
                    </div>
                    <div className="field">
                        <label className="field-label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={loading || !username || !password}
                        style={{ marginTop: 8, justifyContent: 'center', padding: '12px' }}
                    >
                        {loading ? 'Signing in…' : 'Sign In →'}
                    </button>
                </form>

                <p style={{ marginTop: 20, fontSize: 11, color: 'var(--muted2)', textAlign: 'center' }}>
                    admin / admin123 · luisa.mele / admin123
                </p>
            </div>
        </div>
    )
}