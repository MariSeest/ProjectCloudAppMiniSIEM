import { useEffect, useState } from 'react'
import { incidentsApi } from '../api'

interface RiskAnalysis {
    probability: number
    level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    reasoning: string
    mainFactors: string[]
    recommendation: string
    estimatedTimeframe: string
    similarPatterns: string
}

function levelColor(level: string) {
    switch (level) {
        case 'CRITICAL': return { bg: '#FCEBEB', border: '#E24B4A', text: '#791F1F', badge: '#A32D2D' }
        case 'HIGH': return { bg: '#FAEEDA', border: '#EF9F27', text: '#633806', badge: '#854F0B' }
        case 'MEDIUM': return { bg: '#E6F1FB', border: '#378ADD', text: '#042C53', badge: '#185FA5' }
        default: return { bg: '#EAF3DE', border: '#639922', text: '#173404', badge: '#3B6D11' }
    }
}

function computeRisk(incidents: any[]): RiskAnalysis {
    if (incidents.length === 0) {
        return {
            probability: 10,
            level: 'LOW',
            reasoning: 'Nessun incidente registrato nel sistema. Il rischio è considerato basso, ma è consigliabile mantenere il monitoraggio attivo.',
            mainFactors: ['Nessun incidente storico', 'Sistema in stato iniziale', 'Monitoraggio attivo consigliato'],
            recommendation: 'Attivare il monitoraggio continuo e configurare gli alert per rilevare i primi segnali di compromissione.',
            estimatedTimeframe: 'Rischio basso nei prossimi 30 giorni',
            similarPatterns: 'Nessun pattern identificabile senza dati storici.',
        }
    }

    const total = incidents.length
    const open = incidents.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length
    const critical = incidents.filter(i => i.severity === 'CRITICAL').length
    const high = incidents.filter(i => i.severity === 'HIGH').length
    const resolved = incidents.filter(i => i.status === 'RESOLVED').length
    const unresolved = total - resolved

    // Calcolo probabilità basato su fattori reali
    let prob = 20
    prob += Math.min(total * 5, 30)         // più incidenti = più rischio
    prob += critical * 15                    // critici pesano molto
    prob += high * 8                         // alti pesano
    prob += open * 10                        // aperti aumentano il rischio
    prob -= resolved * 3                     // risolti abbassano il rischio
    prob = Math.min(Math.max(prob, 5), 95)   // clamp 5-95

    // Recenza — incidenti recenti pesano di più
    const now = Date.now()
    const recent = incidents.filter(i => {
        const d = new Date(i.createdAt).getTime()
        return (now - d) < 7 * 24 * 60 * 60 * 1000 // ultimi 7 giorni
    }).length
    if (recent > 0) prob = Math.min(prob + recent * 8, 95)

    // CVE correlate
    const withCve = incidents.filter(i => i.cveIds && i.cveIds.length > 0).length
    if (withCve > 0) prob = Math.min(prob + withCve * 5, 95)

    const level: RiskAnalysis['level'] =
        prob >= 75 ? 'CRITICAL' : prob >= 50 ? 'HIGH' : prob >= 25 ? 'MEDIUM' : 'LOW'

    // Genera reasoning basato sui dati reali
    const reasoning = [
        `L'analisi degli ${total} incidenti registrati indica un livello di rischio ${level.toLowerCase()}.`,
        open > 0
            ? `Sono presenti ${open} incidenti non ancora risolti, il che aumenta significativamente la superficie di attacco.`
            : 'Tutti gli incidenti risultano risolti, il che riduce il rischio residuo.',
        critical > 0
            ? `${critical} incidenti critici sono stati registrati, indicando la presenza di minacce ad alto impatto.`
            : 'Nessun incidente critico registrato.',
        recent > 0
            ? `${recent} incidenti si sono verificati negli ultimi 7 giorni, suggerendo un'attività di attacco in corso.`
            : 'Nessun incidente recente negli ultimi 7 giorni.',
        withCve > 0
            ? `${withCve} incidenti sono correlati a CVE note, aumentando il rischio di exploit automatizzati.`
            : 'Nessuna CVE correlata identificata.',
    ].join(' ')

    // Fattori principali
    const factors: string[] = []
    if (open > 0) factors.push(`${open} incidenti aperti non risolti`)
    if (critical > 0) factors.push(`${critical} incidenti di severità CRITICAL`)
    if (recent > 0) factors.push(`${recent} incidenti negli ultimi 7 giorni`)
    if (withCve > 0) factors.push(`${withCve} incidenti con CVE correlate`)
    if (high > 0) factors.push(`${high} incidenti di severità HIGH`)
    if (unresolved > 0) factors.push(`${unresolved} incidenti senza risoluzione`)
    if (factors.length === 0) factors.push('Nessun fattore critico identificato')

    // Raccomandazione basata sul livello
    const recommendations: Record<string, string> = {
        CRITICAL: 'Attivare immediatamente il piano di risposta agli incidenti. Isolare i sistemi compromessi, notificare il CSIRT e avviare la procedura di notifica ACN entro 24 ore.',
        HIGH: 'Aumentare il livello di monitoraggio, chiudere gli incidenti aperti con priorità alta e verificare la presenza di indicatori di compromissione (IoC) sui sistemi critici.',
        MEDIUM: 'Rivedere e aggiornare le policy di sicurezza, assicurarsi che tutti gli incidenti aperti abbiano un responsabile assegnato e pianificare una verifica della postura di sicurezza.',
        LOW: 'Mantenere il monitoraggio standard, aggiornare le firme degli strumenti di rilevamento e condurre esercitazioni periodiche di risposta agli incidenti.',
    }

    const timeframes: Record<string, string> = {
        CRITICAL: 'Rischio immediato — prossime 24-48 ore',
        HIGH: 'Rischio elevato entro i prossimi 7 giorni',
        MEDIUM: 'Rischio moderato entro i prossimi 30 giorni',
        LOW: 'Rischio basso — monitoraggio nei prossimi 90 giorni',
    }

    const patterns = withCve > 0
        ? `Rilevati pattern di attacco correlati a vulnerabilità note (CVE). Gli incidenti mostrano un profilo compatibile con campagne di exploitation automatizzato.`
        : total > 3
            ? `Il volume degli incidenti suggerisce un pattern di attività persistente. Possibile correlazione con attività di ricognizione o accesso non autorizzato continuativo.`
            : `Dataset insufficiente per identificare pattern ricorrenti. Aumentare il periodo di osservazione per una stima più accurata.`

    return {
        probability: Math.round(prob),
        level,
        reasoning,
        mainFactors: factors.slice(0, 4),
        recommendation: recommendations[level],
        estimatedTimeframe: timeframes[level],
        similarPatterns: patterns,
    }
}

export default function RiskPredictor() {
    const [incidents, setIncidents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)
    const [error, setError] = useState('')
    const [lastUpdated, setLastUpdated] = useState<string | null>(null)

    useEffect(() => { void loadIncidents() }, [])

    async function loadIncidents() {
        setLoading(true)
        try {
            const data = await incidentsApi.list()
            setIncidents(Array.isArray(data) ? data : (data as any).content || [])
        } catch {
            setError('Errore nel caricamento degli incidenti')
        } finally {
            setLoading(false)
        }
    }

    async function analyze() {
        setAnalyzing(true)
        setError('')
        setAnalysis(null)
        // Simula latenza analisi
        await new Promise(r => setTimeout(r, 1800))
        const result = computeRisk(incidents)
        setAnalysis(result)
        setLastUpdated(new Date().toLocaleString())
        setAnalyzing(false)
    }

    const colors = analysis ? levelColor(analysis.level) : levelColor('LOW')

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Risk Predictor</h1>
                    <p className="page-subtitle">Analisi predittiva degli incidenti di sicurezza</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {lastUpdated && (
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>Aggiornato: {lastUpdated}</span>
                    )}
                    <button className="btn btn-primary" onClick={() => void analyze()} disabled={analyzing || loading}>
                        {analyzing ? '🔄 Analisi in corso...' : '🎯 Analizza Rischio'}
                    </button>
                </div>
            </div>

            {error && <div className="alert-msg alert-msg--danger">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                    { label: 'Totale Incidenti', value: incidents.length },
                    { label: 'Critici', value: incidents.filter((i: any) => i.severity === 'CRITICAL').length },
                    { label: 'Aperti', value: incidents.filter((i: any) => ['OPEN','INVESTIGATING'].includes(i.status)).length },
                    { label: 'Risolti', value: incidents.filter((i: any) => i.status === 'RESOLVED').length },
                ].map((stat, i) => (
                    <div key={i} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>{stat.value}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {analyzing && (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                    <div style={{ color: 'var(--text)', fontWeight: 500 }}>
                        Calcolo probabilità in corso...
                    </div>
                    <div style={{ color: 'var(--muted2)', fontSize: 13, marginTop: 8 }}>
                        Analisi di {incidents.length} incidenti, frequenza, severità e pattern
                    </div>
                </div>
            )}

            {analysis && !analyzing && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ borderLeft: `4px solid ${colors.border}`, background: colors.bg, padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 13, color: colors.badge, fontWeight: 500, marginBottom: 8 }}>
                                    PROBABILITÀ NUOVO INCIDENTE
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontSize: 64, fontWeight: 700, color: colors.text, lineHeight: 1 }}>
                    {analysis.probability}%
                  </span>
                                    <span style={{ background: colors.badge, color: '#fff', padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                    {analysis.level}
                  </span>
                                </div>
                                <div style={{ fontSize: 13, color: colors.text, marginTop: 8 }}>
                                    {analysis.estimatedTimeframe}
                                </div>
                            </div>
                            <svg viewBox="0 0 120 120" width="120" height="120">
                                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                                <circle
                                    cx="60" cy="60" r="50" fill="none"
                                    stroke={colors.border} strokeWidth="10"
                                    strokeDasharray={`${(analysis.probability / 100) * 314} 314`}
                                    strokeLinecap="round" transform="rotate(-90 60 60)"
                                />
                                <text x="60" y="65" textAnchor="middle" fontSize="20" fontWeight="700" fill={colors.text}>
                                    {analysis.probability}%
                                </text>
                            </svg>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500, marginBottom: 10 }}>ANALISI</div>
                        <p style={{ color: 'var(--text)', lineHeight: 1.7, margin: 0 }}>{analysis.reasoning}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="card" style={{ padding: 20 }}>
                            <div style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500, marginBottom: 12 }}>FATTORI PRINCIPALI</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {analysis.mainFactors.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ width: 20, height: 20, borderRadius: '50%', background: colors.badge, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                      {i + 1}
                    </span>
                                        <span style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className="card" style={{ padding: 20, borderLeft: `3px solid ${colors.border}` }}>
                                <div style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500, marginBottom: 8 }}>RACCOMANDAZIONE</div>
                                <p style={{ color: 'var(--text)', margin: 0, lineHeight: 1.6, fontSize: 14 }}>{analysis.recommendation}</p>
                            </div>
                            <div className="card" style={{ padding: 20 }}>
                                <div style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500, marginBottom: 8 }}>PATTERN SIMILI</div>
                                <p style={{ color: 'var(--text)', margin: 0, lineHeight: 1.6, fontSize: 14 }}>{analysis.similarPatterns}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 500, marginBottom: 12 }}>SCALA DI RISCHIO</div>
                        <div style={{ position: 'relative', height: 24, borderRadius: 12, overflow: 'hidden', background: 'linear-gradient(to right, #639922, #378ADD, #EF9F27, #E24B4A)' }}>
                            <div style={{ position: 'absolute', left: `${analysis.probability}%`, top: '50%', transform: 'translate(-50%, -50%)', width: 20, height: 20, borderRadius: '50%', background: '#fff', border: `3px solid ${colors.border}` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                            {['Basso', 'Medio', 'Alto', 'Critico'].map(l => (
                                <span key={l} style={{ fontSize: 11, color: 'var(--muted2)' }}>{l}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {!analysis && !analyzing && (
                <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                    <div style={{ fontWeight: 500, color: 'var(--text)', marginBottom: 8 }}>Analisi predittiva del rischio</div>
                    <div style={{ color: 'var(--muted2)', fontSize: 14, marginBottom: 20 }}>
                        Clicca "Analizza Rischio" per calcolare la probabilità di un nuovo incidente
                        basandosi sugli {incidents.length} incidenti registrati
                    </div>
                    <button className="btn btn-primary" onClick={() => void analyze()} disabled={loading || incidents.length === 0}>
                        🎯 Avvia Analisi
                    </button>
                </div>
            )}
        </div>
    )
}