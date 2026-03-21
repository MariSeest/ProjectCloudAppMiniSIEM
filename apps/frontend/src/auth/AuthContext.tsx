import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import api from '../api/client'

interface AuthUser {
    userId: string
    username: string
    fullName: string
    name: string
    email: string
    role: string
    tenantId: string | null
    tenantName: string | null
    token: string
}

interface AuthCtx {
    user: AuthUser | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
    activeTenantId: string | null
    setActiveTenantId: (id: string) => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTenantId, setActiveTenantId] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem('minisiem_token')
        if (stored) {
            api.defaults.headers.common['Authorization'] = `Bearer ${stored}`
            api.get('/auth/me')
                .then((r) => {
                    const d = r.data
                    setUser({
                        userId: d.id,
                        username: d.username,
                        fullName: d.fullName,
                        name: d.fullName || d.username,
                        email: d.email || '',
                        role: d.role,
                        tenantId: d.tenantId,
                        tenantName: d.tenantName,
                        token: stored,
                    })
                    setActiveTenantId(d.tenantId)
                })
                .catch(() => {
                    localStorage.removeItem('minisiem_token')
                    delete api.defaults.headers.common['Authorization']
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    async function login(username: string, password: string) {
        const r = await api.post('/auth/login', { username, password })
        const d = r.data
        localStorage.setItem('minisiem_token', d.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${d.token}`
        setUser({
            userId: d.userId,
            username: d.username,
            fullName: d.fullName,
            name: d.fullName || d.username,
            email: d.email || '',
            role: d.role,
            tenantId: d.tenantId,
            tenantName: d.tenantName,
            token: d.token,
        })
        setActiveTenantId(d.tenantId)
    }

    function logout() {
        localStorage.removeItem('minisiem_token')
        delete api.defaults.headers.common['Authorization']
        setUser(null)
        setActiveTenantId(null)
    }

    return (
        <Ctx.Provider value={{ user, loading, login, logout, activeTenantId, setActiveTenantId }}>
            {children}
        </Ctx.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useAuth must be inside AuthProvider')
    return ctx
}