import { useEffect, useState } from 'react'
import { acnApi } from '../api'

const TIPOLOGIE = ['Pre-notifica (entro 24h)', 'Notifica iniziale (entro 72h)', 'Notifica intermedia', 'Notifica finale']
const SETTORI = ['Energia', 'Trasporti', 'Settore bancario', 'Infrastrutture dei mercati finanziari', 'Sanità', 'Fornitura e distribuzione di acqua potabile', 'Acque reflue', 'Infrastrutture digitali', 'Gestione dei servizi ICT (B2B)', 'Pubblica Amministrazione', 'Spazio', 'Servizi postali e di corriere', 'Gestione dei rifiuti', 'Fornitori di servizi digitali', 'Organizzazioni di ricerca']
const STATI_INCIDENTE = ['Concluso', 'In corso ma gestito', 'In corso non gestito']
const TIPOLOGIE_INC = ['Cyber (compilare sezione G)', 'non-Cyber (compilare sezione H)', 'entrambi (compilare sezione G ed H)']
const TASSONOMIE = ['Impact - Account Compromise', 'Impact - Application Compromise', 'Impact - Availability', 'Impact - Data Exfiltration', 'Impact - Data Exposure', 'Impact - Data Manipulation', 'Impact - No Impact', 'Impact - System Compromise', 'Root Cause - Human Errors', 'Root Cause - Malicious Actions', 'Root Cause - System Failure', 'Root Cause - Third Party Failure', 'Severity - High', 'Severity - Medium', 'Active Scanning - Credential Scanning', 'Active Scanning - Network Scanning', 'Active Scanning - Vulnerability Scanning']

function Section({ title, open, onToggle, children }: any) {
    return (
        <div className="acn-section">
            <div className="acn-section-header" onClick={onToggle}>
                <span className="acn-section-title">{title}</span>
                <span>{open ? '▲' : '▼'}</span>
            </div>
            {open && <div className="acn-section-body">{children}</div>}
        </div>
    )
}

function F({ label, required, children }: any) {
    return (
        <div className="field">
            <label className="field-label">{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
            {children}
        </div>
    )
}

export default function AcnReports() {
    const [reports, setReports] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'list' | 'form'>('list')
    const [editId, setEditId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState('')
    const [open, setOpen] = useState<Record<string, boolean>>({ A: true, B: false, C: false, D: false, E: false, F: false, G: false, H: false, I: false, L: false })

    const [notifType, setNotifType] = useState(TIPOLOGIE[0])
    const [sA, setSA] = useState<any>({})
    const [sB, setSB] = useState<any>({})
    const [sC, setSC] = useState<any>({})
    const [sD, setSD] = useState<any>({})
    const [sE, setSE] = useState<any>({})
    const [sF, setSF] = useState<any>({})
    const [sG, setSG] = useState<any>({})
    const [sH, setSH] = useState<any>({})
    const [sI, setSI] = useState<any>({})
    const [sL, setSL] = useState<any>({})

    async function load() {
        setLoading(true)
        try { setReports(await acnApi.list()) }
        finally { setLoading(false) }
    }

    useEffect(() => { load() }, [])

    function resetForm() {
        setSA({}); setSB({}); setSC({}); setSD({}); setSE({}); setSF({}); setSG({}); setSH({}); setSI({}); setSL({})
        setNotifType(TIPOLOGIE[0]); setEditId(null)
    }

    async function save(submit = false) {
        setSaving(true)
        try {
            const payload = { notificationType: notifType, sectionA: sA, sectionB: sB, sectionC: sC, sectionD: sD, sectionE: sE, sectionF: sF, sectionG: sG, sectionH: sH, sectionI: sI, sectionL: sL }
            let report
            if (editId) report = await acnApi.update(editId, payload)
            else report = await acnApi.create(payload)
            if (submit) await acnApi.submit(report.id)
            setSuccess(submit ? '✅ Report submitted to ACN!' : '💾 Report saved as draft.')
            setView('list'); resetForm(); await load()
        } finally { setSaving(false) }
    }

    function openEdit(r: any) {
        setEditId(r.id); setNotifType(r.notificationType || TIPOLOGIE[0])
        setSA(r.sectionA || {}); setSB(r.sectionB || {}); setSC(r.sectionC || {})
        setSD(r.sectionD || {}); setSE(r.sectionE || {}); setSF(r.sectionF || {})
        setSG(r.sectionG || {}); setSH(r.sectionH || {}); setSI(r.sectionI || {}); setSL(r.sectionL || {})
        setView('form')
    }

    const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }))
    const upd = (setter: any, key: string, val: string) => setter((p: any) => ({ ...p, [key]: val }))

    if (view === 'form') return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ACN Incident Report</h1>
                    <p className="page-subtitle">Notifica ai sensi dell'art. 25-26 D.lgs 138/2024 (NIS2)</p>
                </div>
                <div className="page-actions">
                    <button className="btn" onClick={() => { setView('list'); resetForm() }}>← Back</button>
                    <button className="btn" onClick={() => save(false)} disabled={saving}>💾 Save Draft</button>
                    <button className="btn btn-primary" onClick={() => save(true)} disabled={saving}>📤 Submit to ACN</button>
                </div>
            </div>

            {success && <div className="alert-msg alert-msg--success">{success}</div>}

            <div className="field" style={{ maxWidth: 360 }}>
                <label className="field-label">Tipologia di Notifica *</label>
                <select className="select" value={notifType} onChange={e => setNotifType(e.target.value)}>
                    {TIPOLOGIE.map(t => <option key={t}>{t}</option>)}
                </select>
            </div>

            <Section title="SEZIONE A — Dati dell'Organizzazione" open={open.A} onToggle={() => toggle('A')}>
                <div className="form-grid">
                    <F label="Denominazione Sociale" required><input className="input" value={sA.denominazione || ''} onChange={e => upd(setSA, 'denominazione', e.target.value)} /></F>
                    <F label="Tipologia di soggetto" required><input className="input" value={sA.tipologia || ''} onChange={e => upd(setSA, 'tipologia', e.target.value)} placeholder="Essenziale / Importante" /></F>
                    <F label="Codice Fiscale" required><input className="input" value={sA.codiceFiscale || ''} onChange={e => upd(setSA, 'codiceFiscale', e.target.value)} /></F>
                    <F label="Partita IVA"><input className="input" value={sA.piva || ''} onChange={e => upd(setSA, 'piva', e.target.value)} /></F>
                    <F label="Codice NIS (ENISA)" required><input className="input" value={sA.codiceNIS || ''} onChange={e => upd(setSA, 'codiceNIS', e.target.value)} /></F>
                    <F label="Domicilio digitale (PEC)" required><input className="input" value={sA.pec || ''} onChange={e => upd(setSA, 'pec', e.target.value)} placeholder="ufficio@pec.example.it" /></F>
                </div>
                <F label="Settori di competenza (NIS2)">
                    <select className="select" value={sA.settore || ''} onChange={e => upd(setSA, 'settore', e.target.value)}>
                        <option value="">Seleziona settore…</option>
                        {SETTORI.map(s => <option key={s}>{s}</option>)}
                    </select>
                </F>
            </Section>

            <Section title="SEZIONE B — Dati del Segnalante e Referente CSIRT" open={open.B} onToggle={() => toggle('B')}>
                <div className="form-grid">
                    <F label="Nome e Cognome" required><input className="input" value={sB.nome || ''} onChange={e => upd(setSB, 'nome', e.target.value)} /></F>
                    <F label="Ruolo e funzioni"><input className="input" value={sB.ruolo || ''} onChange={e => upd(setSB, 'ruolo', e.target.value)} /></F>
                    <F label="Email PEC/PEO" required><input className="input" value={sB.email || ''} onChange={e => upd(setSB, 'email', e.target.value)} /></F>
                    <F label="Recapito telefonico" required><input className="input" value={sB.telefono || ''} onChange={e => upd(setSB, 'telefono', e.target.value)} /></F>
                </div>
            </Section>

            <Section title="SEZIONE C — Descrizione dell'Incidente" open={open.C} onToggle={() => toggle('C')}>
                <div className="form-grid">
                    <F label="Stato dell'incidente" required>
                        <select className="select" value={sC.stato || ''} onChange={e => upd(setSC, 'stato', e.target.value)}>
                            <option value="">Seleziona…</option>
                            {STATI_INCIDENTE.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </F>
                    <F label="Tipologia incidente" required>
                        <select className="select" value={sC.tipologia || ''} onChange={e => upd(setSC, 'tipologia', e.target.value)}>
                            <option value="">Seleziona…</option>
                            {TIPOLOGIE_INC.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </F>
                    <F label="Data rilevamento" required>
                        <input className="input" type="datetime-local" value={sC.dataRilevamento || ''} onChange={e => upd(setSC, 'dataRilevamento', e.target.value)} />
                    </F>
                    <F label="Data inizio evento">
                        <input className="input" type="datetime-local" value={sC.dataInizio || ''} onChange={e => upd(setSC, 'dataInizio', e.target.value)} />
                    </F>
                </div>
                <F label="Descrizione" required>
                    <textarea className="textarea" rows={5} maxLength={1000} value={sC.descrizione || ''} onChange={e => upd(setSC, 'descrizione', e.target.value)} placeholder="Descrizione dettagliata (max 1000 caratteri)" />
                    <small style={{ color: 'var(--muted2)' }}>{(sC.descrizione || '').length}/1000</small>
                </F>
                <F label="Vulnerabilità sfruttate (se note)">
                    <textarea className="textarea" rows={3} value={sC.vulnerabilita || ''} onChange={e => upd(setSC, 'vulnerabilita', e.target.value)} />
                </F>
            </Section>

            <Section title="SEZIONE D — Tipologia dell'Incidente (Tassonomia NIS2)" open={open.D} onToggle={() => toggle('D')}>
                <F label="Tassonomia NIS *">
                    <select className="select" value={sD.tassonomia || ''} onChange={e => upd(setSD, 'tassonomia', e.target.value)}>
                        <option value="">Seleziona…</option>
                        {TASSONOMIE.map(t => <option key={t}>{t}</option>)}
                    </select>
                </F>
                <F label="Tassonomia ACN aggiuntiva">
                    <input className="input" value={sD.tassonomiaACN || ''} onChange={e => upd(setSD, 'tassonomiaACN', e.target.value)} />
                </F>
            </Section>

            <Section title="SEZIONE E — Descrizione Impatto" open={open.E} onToggle={() => toggle('E')}>
                <div className="form-grid">
                    <F label="Numero utenti impattati"><input className="input" type="number" value={sE.utentiImpattati || ''} onChange={e => upd(setSE, 'utentiImpattati', e.target.value)} /></F>
                    <F label="Percentuale utenti impattati"><input className="input" type="number" max="100" value={sE.percentualeUtenti || ''} onChange={e => upd(setSE, 'percentualeUtenti', e.target.value)} placeholder="%" /></F>
                    <F label="Data inizio interruzione"><input className="input" type="datetime-local" value={sE.inizioInterruzione || ''} onChange={e => upd(setSE, 'inizioInterruzione', e.target.value)} /></F>
                    <F label="Data fine interruzione"><input className="input" type="datetime-local" value={sE.fineInterruzione || ''} onChange={e => upd(setSE, 'fineInterruzione', e.target.value)} /></F>
                    <F label="Durata disservizio (minuti)"><input className="input" type="number" value={sE.durata || ''} onChange={e => upd(setSE, 'durata', e.target.value)} /></F>
                    <F label="Violazione dati personali">
                        <select className="select" value={sE.violazioneDati || ''} onChange={e => upd(setSE, 'violazioneDati', e.target.value)}>
                            <option value="">Seleziona…</option><option>Si</option><option>No</option><option>Non noto</option>
                        </select>
                    </F>
                </div>
                <F label="Azioni già intraprese per mitigare l'impatto">
                    <textarea className="textarea" rows={4} value={sE.azioniMitigazione || ''} onChange={e => upd(setSE, 'azioniMitigazione', e.target.value)} />
                </F>
            </Section>

            <Section title="SEZIONE F — Azioni di Contenimento" open={open.F} onToggle={() => toggle('F')}>
                <F label="Business Continuity Response attivata">
                    <select className="select" value={sF.bcp || ''} onChange={e => upd(setSF, 'bcp', e.target.value)}>
                        <option value="">Seleziona…</option><option>Si</option><option>No</option>
                    </select>
                </F>
                <F label="Misure di recupero" required>
                    <textarea className="textarea" rows={4} value={sF.misureRecupero || ''} onChange={e => upd(setSF, 'misureRecupero', e.target.value)} />
                </F>
                <F label="Minacce e tecniche utilizzate (Threat Actor)">
                    <textarea className="textarea" rows={3} value={sF.threatActor || ''} onChange={e => upd(setSF, 'threatActor', e.target.value)} />
                </F>
            </Section>

            <Section title="SEZIONE G — Diffusione Geografica Trasfrontaliera" open={open.G} onToggle={() => toggle('G')}>
                <F label="L'operatore opera in due o più Stati europei?">
                    <select className="select" value={sG.transfrontaliero || ''} onChange={e => upd(setSG, 'transfrontaliero', e.target.value)}>
                        <option value="">Seleziona…</option><option>Si</option><option>No</option>
                    </select>
                </F>
                {sG.transfrontaliero === 'Si' && (
                    <F label="Descrivere gli Stati EU coinvolti">
                        <textarea className="textarea" rows={3} value={sG.statiCoinvolti || ''} onChange={e => upd(setSG, 'statiCoinvolti', e.target.value)} />
                    </F>
                )}
            </Section>

            <Section title="SEZIONE H — Eventuali Notifiche" open={open.H} onToggle={() => toggle('H')}>
                <F label="Notifica inviata alle forze di polizia">
                    <input className="input" value={sH.polizia || ''} onChange={e => upd(setSH, 'polizia', e.target.value)} placeholder="Carabinieri, Polizia di Stato…" />
                </F>
                <F label="Notifica al Garante della Privacy">
                    <select className="select" value={sH.garante || ''} onChange={e => upd(setSH, 'garante', e.target.value)}>
                        <option value="">Seleziona…</option><option>Si</option><option>No</option>
                    </select>
                </F>
                <F label="Notifica ad altri CERT/CSIRT">
                    <input className="input" value={sH.cert || ''} onChange={e => upd(setSH, 'cert', e.target.value)} placeholder="CSIRT regionali, CERT esteri…" />
                </F>
            </Section>

            <Section title="SEZIONE I — Tipologia di Attacco (MITRE ATT&CK)" open={open.I} onToggle={() => toggle('I')}>
                <F label="ID MITRE ATT&CK (es. T1059, T1190)">
                    <input className="input" value={sI.mitreId || ''} onChange={e => upd(setSI, 'mitreId', e.target.value)} placeholder="T1059, T1190" />
                </F>
                <F label="Descrizione attacco">
                    <textarea className="textarea" rows={4} maxLength={1000} value={sI.descrizione || ''} onChange={e => upd(setSI, 'descrizione', e.target.value)} />
                    <small style={{ color: 'var(--muted2)' }}>{(sI.descrizione || '').length}/1000</small>
                </F>
            </Section>

            <Section title="SEZIONE L — Indicatori di Compromissione (IoC/IoA)" open={open.L} onToggle={() => toggle('L')}>
                <F label="Indicatori (uno per riga, formato: tipo|valore)">
          <textarea className="textarea" rows={6} value={sL.indicatori || ''} onChange={e => upd(setSL, 'indicatori', e.target.value)}
                    placeholder={'IoC|192.168.1.100\nIoC|malware.exe\nIoA|T1059'} />
                </F>
            </Section>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn" onClick={() => { setView('list'); resetForm() }}>Cancel</button>
                <button className="btn" onClick={() => save(false)} disabled={saving}>💾 Save Draft</button>
                <button className="btn btn-primary" onClick={() => save(true)} disabled={saving}>📤 Submit to ACN</button>
            </div>
        </div>
    )

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">ACN Reports</h1>
                    <p className="page-subtitle">Segnalazioni NIS2 — art. 25-26 D.lgs 138/2024</p>
                </div>
                <button className="btn btn-primary" onClick={() => { resetForm(); setView('form') }}>+ Nuova Segnalazione</button>
            </div>
            {success && <div className="alert-msg alert-msg--success">{success}</div>}
            <div className="card">
                <div className="card-head"><span className="card-title">Report ACN</span><span className="card-count">{reports.length}</span></div>
                {loading
                    ? <div className="loading-wrap"><div className="spinner" /></div>
                    : <table className="data-table">
                        <thead><tr><th>ID</th><th>Tipologia</th><th>Stato</th><th>Organizzazione</th><th>Creato</th><th>Inviato</th><th>Azioni</th></tr></thead>
                        <tbody>
                        {reports.length === 0
                            ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-state__icon">📋</div>Nessun report. Crea la prima segnalazione.</div></td></tr>
                            : reports.map((r: any) => (
                                <tr key={r.id}>
                                    <td className="mono" style={{ fontSize: 11 }}>{r.id?.slice(0, 8)}…</td>
                                    <td style={{ fontSize: 12 }}>{r.notificationType || '—'}</td>
                                    <td><span className={`badge ${r.status === 'SUBMITTED' ? 'badge-resolved' : r.status === 'DRAFT' ? 'badge-medium' : 'badge-closed'}`}>{r.status}</span></td>
                                    <td style={{ fontSize: 12 }}>{r.sectionA?.denominazione || '—'}</td>
                                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted2)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                                    <td className="mono" style={{ fontSize: 11, color: 'var(--muted2)' }}>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : '—'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 5 }}>
                                            <button className="btn btn-xs" onClick={() => openEdit(r)}>Edit</button>
                                            {r.status === 'DRAFT' && (
                                                <button className="btn btn-xs btn-primary" onClick={async () => { await acnApi.submit(r.id); await load() }}>Submit</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                        </tbody>
                    </table>
                }
            </div>
        </div>
    )
}