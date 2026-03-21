import { useEffect, useState } from 'react'
import { usersApi } from '../api'
import { useAuth } from '../auth/AuthContext'

export default function UserManagement() {
    const { user: me } = useAuth()
    const [users, setUsers] = useState<any[]>([])
    const [tenants, setTenants] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editUser, setEditUser] = useState<any>(null)
    const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', role: 'READ_ONLY', tenantId: '', isActive: true })

    async function load() {
        setLoading(true)
        try {
            const [u, t] = await Promise.all([usersApi.list(), usersApi.tenants()])
            setUsers(u); setTenants(t)
        } catch (e: any) { setError(String(e)) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    function openCreate() {
        setEditUser(null)
        setForm({ username: '', email: '', password: '', fullName: '', role: 'READ_ONLY', tenantId: '', isActive: true })
        setShowModal(true)
    }

    function openEdit(u: any) {
        setEditUser(u)
        setForm({ username: u.username, email: u.email, password: '', fullName: u.fullName || '', role: u.role, tenantId: u.tenantId || '', isActive: u.isActive })
        setShowModal(true)
    }

    async function save() {
        setError('')
        try {
            if (editUser) {
                await usersApi.update(editUser.id, {
                    fullName: form.fullName, role: form.role, isActive: form.isActive,
                    password: form.password || undefined, tenantId: form.tenantId || undefined
                })
            } else {
                await usersApi.create({ ...form, tenantId: form.tenantId || undefined })
            }
            setShowModal(false); await load()
        } catch (e: any) { setError(String(e)) }
    }

    async function deleteUser(id: string) {
        if (!confirm('Delete this user?')) return
        try { await usersApi.delete(id); await load() }
        catch (e: any) { setError(String(e)) }
    }

    const ROLE_BADGE: Record<string, string> = {
        ADMIN: 'badge-critical', ANALYST: 'badge-high', READ_ONLY: 'badge-info'
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">Manage platform users, roles and tenant assignments</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>+ Add User</button>
            </div>

            {error && <div className="alert-msg alert-msg--error">{error}</div>}

            <div className="card">
                <div className="card-head">
                    <span className="card-title">Users</span>
                    <span className="card-count">{users.length} total</span>
                </div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead>
                        <tr>
                            <th>Name</th><th>Username</th><th>Email</th>
                            <th style={{ width: 100 }}>Role</th>
                            <th style={{ width: 120 }}>Tenant</th>
                            <th style={{ width: 80 }}>Status</th>
                            <th style={{ width: 140 }}>Last Login</th>
                            <th style={{ width: 110 }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u: any) => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 600 }}>{u.fullName || '—'}</td>
                                <td className="mono" style={{ fontSize: 12 }}>{u.username}</td>
                                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{u.email}</td>
                                <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-info'}`}>{u.role}</span></td>
                                <td style={{ fontSize: 12, color: 'var(--muted)' }}>{u.tenantName || 'Global'}</td>
                                <td><span className={`badge ${u.isActive ? 'badge-resolved' : 'badge-closed'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td className="mono" style={{ fontSize: 11, color: 'var(--muted2)' }}>
                                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '—'}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: 5 }}>
                                        <button className="btn btn-xs" onClick={() => openEdit(u)}>Edit</button>
                                        {u.id !== me?.userId && (
                                            <button className="btn btn-xs btn-danger" onClick={() => deleteUser(u.id)}>Del</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                }
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">{editUser ? 'Edit User' : 'New User'}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16 }}>
                            {!editUser && (
                                <div className="form-grid">
                                    <div className="field">
                                        <label className="field-label">Username *</label>
                                        <input className="input" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} placeholder="john.doe" />
                                    </div>
                                    <div className="field">
                                        <label className="field-label">Email *</label>
                                        <input className="input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="john@example.com" />
                                    </div>
                                </div>
                            )}
                            <div className="form-grid">
                                <div className="field">
                                    <label className="field-label">Full Name</label>
                                    <input className="input" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} placeholder="John Doe" />
                                </div>
                                <div className="field">
                                    <label className="field-label">{editUser ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                                    <input className="input" type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="field">
                                    <label className="field-label">Role</label>
                                    <select className="select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                                        <option value="READ_ONLY">READ_ONLY</option>
                                        <option value="ANALYST">ANALYST</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label className="field-label">Tenant</label>
                                    <select className="select" value={form.tenantId} onChange={e => setForm(p => ({ ...p, tenantId: e.target.value }))}>
                                        <option value="">Global (no tenant)</option>
                                        {tenants.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {editUser && (
                                <div className="field">
                                    <label className="field-label">Status</label>
                                    <select className="select" value={form.isActive ? 'true' : 'false'} onChange={e => setForm(p => ({ ...p, isActive: e.target.value === 'true' }))}>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}