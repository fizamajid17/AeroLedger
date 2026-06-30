import { useState, useRef, useCallback } from 'react'
import logo from './assets/logo.jpeg'
import './index.css'

const API = 'http://127.0.0.1:8000'

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
      {toasts.map(t => {
        const colors = {
          success: { border: 'var(--teal)', icon: '✓', bg: 'rgba(0,184,148,0.08)', title: 'var(--teal)' },
          error:   { border: 'var(--red)',  icon: '✕', bg: 'rgba(231,76,60,0.08)',  title: 'var(--red)' },
          warn:    { border: 'var(--amber)',icon: '⚠', bg: 'rgba(243,156,18,0.08)', title: 'var(--amber)' },
        }[t.type] || {}
        return (
          <div key={t.id} style={{
            background: `var(--navy-700)`,
            border: `1px solid ${colors.border}`,
            borderLeft: `3px solid ${colors.border}`,
            borderRadius: 'var(--radius-sm)', padding: '12px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            boxShadow: 'var(--shadow)', animation: 'toastIn 0.2s ease',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: colors.bg, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: colors.border, flexShrink: 0, marginTop: 1 }}>{colors.icon}</div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 13, color: colors.title, marginBottom: 2, fontFamily: 'DM Sans, sans-serif' }}>{t.title}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.msg}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Pipeline (signature element) ──────────────────────────────────────────────
function Pipeline({ slaDone, opsDone, invoiceDone }) {
  const steps = [
    { id: 1, label: 'SLA Ingestion', sub: 'PDF contract parsed', done: slaDone },
    { id: 2, label: 'Breach Detection', sub: 'Operational data analysed', done: opsDone },
    { id: 3, label: 'Invoice Generated', sub: 'Penalty PDF exported', done: invoiceDone },
  ]
  return (
    <div style={{ background: 'var(--navy-900)', borderBottom: '1px solid var(--border)', padding: '0 40px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'stretch' }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
              borderBottom: s.done ? '2px solid var(--teal)' : '2px solid transparent',
              transition: 'border-color 0.4s ease',
              paddingBottom: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: s.done ? 'var(--teal)' : 'var(--navy-600)',
                border: `1.5px solid ${s.done ? 'var(--teal)' : 'var(--navy-400)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: s.done ? '#fff' : 'var(--text-muted)',
                boxShadow: s.done ? 'var(--shadow-teal)' : 'none',
                transition: 'all 0.4s ease', flexShrink: 0,
              }}>
                {s.done ? '✓' : s.id}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: s.done ? 'var(--teal)' : 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', lineHeight: 1, marginBottom: 3, transition: 'color 0.3s' }}>{s.label}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>{s.sub}</p>
              </div>
            </div>
            {i < 2 && (
              <div style={{ flex: 1, height: 1, margin: '0 20px', marginBottom: 2, position: 'relative', background: 'var(--navy-500)', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'var(--teal)', transformOrigin: 'left', transform: `scaleX(${s.done ? 1 : 0})`, transition: 'transform 0.5s ease' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Upload Card ───────────────────────────────────────────────────────────────
function UploadCard({ icon, title, subtitle, accept, acceptLabel, onUpload, loading, done, disabled }) {
  const ref = useRef()
  const [dragging, setDragging] = useState(false)

  const handleFile = (file) => { if (!file) return; onUpload(file) }
  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0])
  }, [onUpload])

  return (
    <div
      onClick={() => !disabled && !loading && ref.current.click()}
      onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={!disabled ? onDrop : undefined}
      style={{
        background: dragging ? 'rgba(0,184,148,0.04)' : done ? 'rgba(0,184,148,0.03)' : 'var(--navy-700)',
        border: `1px solid ${dragging ? 'var(--teal)' : done ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '32px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        cursor: disabled ? 'not-allowed' : loading ? 'wait' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 0.25s ease',
        boxShadow: done ? 'var(--shadow-teal)' : 'none',
        minHeight: 230, justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* top accent line when done */}
      {done && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--teal)', boxShadow: '0 0 12px var(--teal)' }} />}

      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: done ? 'var(--teal-subtle)' : 'var(--navy-600)',
        border: `1px solid ${done ? 'var(--border-active)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, transition: 'all 0.3s',
        boxShadow: done ? 'var(--shadow-teal)' : 'none',
      }}>
        {loading ? <Spinner /> : done ? <span style={{ color: 'var(--teal)', fontSize: 20, fontWeight: 700 }}>✓</span> : icon}
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>{title}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 240 }}>{subtitle}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 4 }}>
        <button
          disabled={disabled || loading}
          onClick={e => { e.stopPropagation(); if (!disabled && !loading) ref.current.click() }}
          style={{
            background: done ? 'transparent' : 'var(--teal)',
            color: done ? 'var(--teal)' : '#fff',
            border: done ? '1px solid var(--border-active)' : 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '9px 24px', fontSize: 13, fontWeight: 600,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.01em',
          }}
        >
          {loading ? 'Processing…' : done ? '↺  Re-upload' : 'Select file'}
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>or drag & drop · <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10 }}>{acceptLabel}</span></p>
      </div>

      <input ref={ref} type="file" accept={accept} style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
    </div>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, highlight, warning }) {
  return (
    <div style={{
      background: highlight ? 'linear-gradient(135deg, var(--navy-600), var(--navy-500))' : 'var(--navy-700)',
      border: `1px solid ${highlight ? 'var(--border-active)' : warning ? 'rgba(243,156,18,0.25)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)', padding: '16px 18px',
      boxShadow: highlight ? 'var(--shadow-teal)' : 'none',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: highlight ? 'rgba(0,184,148,0.7)' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>{label}</p>
      <p style={{ fontSize: 17, fontWeight: 700, color: highlight ? 'var(--teal)' : warning ? 'var(--amber)' : 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', wordBreak: 'break-word' }}>{value}</p>
    </div>
  )
}

// ── Breach Panel ─────────────────────────────────────────────────────────────
function BreachPanel({ result, onGenerateInvoice, invoiceLoading }) {
  if (!result) return null

  if (result.status === 'error') return (
    <div style={{ background: 'var(--navy-700)', border: '1px solid rgba(231,76,60,0.3)', borderLeft: '3px solid var(--red)', borderRadius: 'var(--radius)', padding: '20px 24px', marginTop: 28 }}>
      <p style={{ color: 'var(--red)', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>Detection failed</p>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{result.message}</p>
    </div>
  )

  const breaches = result.breaches || []
  const totalPenalty = result.total_penalty ?? 0
  const currency = result.currency || 'INR'
  const hasBreaches = breaches.length > 0

  return (
    <div style={{ marginTop: 36 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontFamily: 'DM Sans, sans-serif' }}>Analysis complete</p>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif' }}>Breach Report</h2>
        </div>
        <span style={{
          background: hasBreaches ? 'var(--red-bg)' : 'var(--green-bg)',
          color: hasBreaches ? 'var(--red)' : 'var(--green)',
          border: `1px solid ${hasBreaches ? 'rgba(231,76,60,0.3)' : 'rgba(39,174,96,0.3)'}`,
          borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700,
          fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.02em',
        }}>
          {hasBreaches ? `${breaches.length} BREACH${breaches.length > 1 ? 'ES' : ''}` : 'COMPLIANT'}
        </span>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Vendor" value={result.vendor || '—'} />
        <StatCard label="Metric" value={result.metric || '—'} />
        <StatCard label="Threshold" value={result.threshold_minutes != null ? `${result.threshold_minutes} min` : '—'} />
        <StatCard label="Penalty / breach" value={result.penalty_per_breach != null ? `${currency} ${result.penalty_per_breach.toLocaleString()}` : '—'} warning />
        <StatCard label="Total breaches" value={result.total_breaches ?? breaches.length} />
        <StatCard label="Total penalty" value={`${currency} ${totalPenalty.toLocaleString()}`} highlight />
      </div>

      {/* AI Summary */}
      {result.summary && (
        <div style={{ background: 'var(--navy-900)', border: '1px solid var(--border)', borderLeft: '2px solid var(--teal)', borderRadius: 'var(--radius-sm)', padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>◆ AI Summary</p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.summary}</p>
        </div>
      )}

      {/* Table */}
      {hasBreaches && (
        <div style={{ overflowX: 'auto', marginBottom: 28, borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--navy-900)' }}>
                {['#', 'Date', 'Flight', 'Actual (min)', 'Threshold (min)', `Penalty (${currency})`].map(h => (
                  <th key={h} style={{ color: 'var(--text-muted)', padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)', fontFamily: 'DM Sans, sans-serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breaches.map((b, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'var(--navy-700)' : 'var(--navy-800)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{i + 1}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text-secondary)' }}>{b.date || '—'}</td>
                  <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{b.flight_number || '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--red)', fontWeight: 700 }}>{b.actual_minutes ?? '—'}</td>
                  <td style={{ padding: '11px 16px', color: 'var(--text-secondary)' }}>{b.threshold_minutes ?? '—'}</td>
                  <td style={{ padding: '11px 16px', fontWeight: 700, color: 'var(--amber)', fontFamily: 'JetBrains Mono, monospace' }}>{b.penalty != null ? b.penalty.toLocaleString() : '—'}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--navy-900)', borderTop: '1px solid var(--border)' }}>
                <td colSpan={5} style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Penalty</td>
                <td style={{ padding: '12px 16px', fontWeight: 800, color: 'var(--teal)', fontSize: 15, fontFamily: 'JetBrains Mono, monospace' }}>{totalPenalty.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Invoice button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={onGenerateInvoice}
          disabled={invoiceLoading || !hasBreaches}
          style={{
            background: !hasBreaches ? 'var(--navy-600)' : 'var(--teal)',
            color: !hasBreaches ? 'var(--text-muted)' : '#fff',
            border: 'none', borderRadius: 'var(--radius-sm)',
            padding: '12px 28px', fontSize: 14, fontWeight: 700,
            cursor: !hasBreaches || invoiceLoading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'all 0.2s', fontFamily: 'DM Sans, sans-serif',
            boxShadow: hasBreaches && !invoiceLoading ? 'var(--shadow-teal)' : 'none',
            letterSpacing: '0.01em',
          }}
        >
          {invoiceLoading ? <><Spinner color="#fff" size={16} /> Generating PDF…</> : '↓  Export Invoice PDF'}
        </button>
        {!hasBreaches && <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No breaches — invoice not applicable</p>}
      </div>
    </div>
  )
}

function Spinner({ color = 'var(--teal)', size = 18 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid ${color}22`, borderTopColor: color,
      display: 'inline-block', animation: 'spin 0.7s linear infinite', flexShrink: 0
    }} />
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [toasts, setToasts] = useState([])
  const [slaLoading, setSlaLoading] = useState(false)
  const [slaDone, setSlaDone] = useState(false)
  const [opsLoading, setOpsLoading] = useState(false)
  const [opsDone, setOpsDone] = useState(false)
  const [breachResult, setBreachResult] = useState(null)
  const [invoiceLoading, setInvoiceLoading] = useState(false)
  const [invoiceDone, setInvoiceDone] = useState(false)

  const toast = (type, title, msg, duration = 5000) => {
    const id = Date.now()
    setToasts(p => [...p, { id, type, title, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration)
  }

  const uploadSLA = async (file) => {
    setSlaLoading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${API}/ingest/sla`, { method: 'POST', body: fd })
      const data = await res.json()
      if (data.status === 'error') { toast('error', 'SLA ingestion failed', data.message) }
      else {
        setSlaDone(true)
        const vendors = data.vendors_found?.join(', ') || 'detected'
        toast('success', 'SLA contract ingested', `Airport: ${data.airport_name || '—'} · Vendors: ${vendors}`)
      }
    } catch (e) { toast('error', 'Connection error', e.message) }
    finally { setSlaLoading(false) }
  }

  const uploadOps = async (file) => {
    setOpsLoading(true); setBreachResult(null)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`${API}/breach/detect`, { method: 'POST', body: fd })
      const data = await res.json()
      setBreachResult(data)
      if (data.status === 'error') { toast('error', 'Detection failed', data.message) }
      else {
        setOpsDone(true)
        const n = data.total_breaches ?? data.breaches?.length ?? 0
        toast(n > 0 ? 'error' : 'success',
          n > 0 ? `${n} SLA breach${n > 1 ? 'es' : ''} detected` : 'Vendor compliant',
          n > 0 ? `Penalty: ${data.currency || 'INR'} ${(data.total_penalty || 0).toLocaleString()}` : 'No violations found in operational data.')
      }
    } catch (e) { toast('error', 'Connection error', e.message) }
    finally { setOpsLoading(false) }
  }

  const generateInvoice = async () => {
    if (!breachResult) return
    setInvoiceLoading(true)
    try {
      const res = await fetch(`${API}/invoice/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breachResult),
      })
      if (!res.ok) { toast('error', 'Invoice generation failed', `Server error: ${res.status}`); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `AeroLedger_Invoice_${breachResult.vendor || 'vendor'}.pdf`
      a.click(); URL.revokeObjectURL(url)
      setInvoiceDone(true)
      toast('success', 'Invoice exported', 'PDF downloaded to your device.')
    } catch (e) { toast('error', 'Connection error', e.message) }
    finally { setInvoiceLoading(false) }
  }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        table { border-collapse: collapse; }
        tr:hover td { background: rgba(255,255,255,0.02) !important; }
        button:hover:not(:disabled) { filter: brightness(1.08); }
      `}</style>

      <Toast toasts={toasts} />

      {/* ── Header ── */}
      <header style={{
        background: 'linear-gradient(180deg, #06111F 0%, #0A1628 100%)',
        borderBottom: '1px solid rgba(0,184,148,0.12)',
        padding: '0 40px', height: 70,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 0 rgba(0,184,148,0.08), 0 4px 24px rgba(0,0,0,0.5)',
      }}>
        {/* Left: Logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Rounded logo container */}
          <div style={{
            width: 46, height: 46,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #0f2847 0%, #0a1628 100%)',
            border: '1.5px solid rgba(0,184,148,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: '0 0 16px rgba(0,184,148,0.12)',
            flexShrink: 0,
          }}>
            <img src={logo} alt="AeroLedger" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Wordmark + tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1, marginBottom: 4 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 21, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>Aero</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 800, fontSize: 21, letterSpacing: '-0.04em', color: 'var(--teal)' }}>Ledger</span>
            </div>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>SLA Compliance Platform</p>
          </div>
        </div>

        {/* Right: Lenok badge + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 3 }}>Powered by</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.01em' }}>Lenok Solutions</p>
          </div>
          <div style={{ width: 1, height: 30, background: 'var(--border)' }} />
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(0,184,148,0.08)',
            border: '1px solid rgba(0,184,148,0.2)',
            borderRadius: 20, padding: '6px 14px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--teal)', fontWeight: 600, letterSpacing: '0.04em' }}>LIVE</span>
          </div>
        </div>
      </header>

      {/* ── Pipeline rail ── */}
      <Pipeline slaDone={slaDone} opsDone={opsDone} invoiceDone={invoiceDone} />

      {/* ── Main ── */}
      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', flex: 1 }}>

        {/* Page title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 6 }}>
            Vendor SLA Analysis
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Upload the SLA contract and operational data to detect breaches and generate a penalty invoice.
          </p>
        </div>

        {/* Upload cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 12 }}>
          <UploadCard
            icon="📄"
            title="SLA Contract"
            subtitle="Airport SLA PDF — thresholds and penalty clauses will be extracted automatically."
            accept=".pdf"
            acceptLabel=".pdf"
            onUpload={uploadSLA}
            loading={slaLoading}
            done={slaDone}
          />
          <UploadCard
            icon="📊"
            title="Operational Data"
            subtitle="Vendor operational report (.docx) — each record is matched against the ingested SLA."
            accept=".docx"
            acceptLabel=".docx"
            onUpload={uploadOps}
            loading={opsLoading}
            done={opsDone}
            disabled={!slaDone}
          />
        </div>

        {!slaDone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, padding: '8px 12px', background: 'var(--amber-bg)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: 'var(--radius-sm)', width: 'fit-content' }}>
            <span style={{ color: 'var(--amber)', fontSize: 12 }}>⚠</span>
            <p style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 500 }}>Ingest SLA contract first to unlock breach detection</p>
          </div>
        )}

        {/* Breach results */}
        <BreachPanel result={breachResult} onGenerateInvoice={generateInvoice} invoiceLoading={invoiceLoading} />
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--navy-900)', borderTop: '1px solid var(--border)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>AeroLedger</span> · Aviation Vendor SLA Compliance · Lenok Solutions Pvt. Ltd.
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>v1.0 · Internal Product</p>
      </footer>
    </>
  )
}