'use client'
import { useState } from 'react'

const ENDPOINT = process.env.NEXT_PUBLIC_SHEET_ENDPOINT || ''
const BASE_COUNT = 10 // markers already on the map

const places = {
  dwarka: [28.5921, 77.046], noida: [28.5355, 77.391], 'greater noida': [28.4744, 77.504],
  gurugram: [28.4595, 77.0266], gurgaon: [28.4595, 77.0266], faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538], indirapuram: [28.646, 77.369], 'vasant kunj': [28.52, 77.158],
  saket: [28.5245, 77.2066], rohini: [28.7495, 77.0565], janakpuri: [28.6219, 77.0878],
  'lajpat nagar': [28.5677, 77.243], 'connaught place': [28.6315, 77.2167], 'mayur vihar': [28.6082, 77.2955],
  'karol bagh': [28.6519, 77.1909], pitampura: [28.7007, 77.131], delhi: [28.6139, 77.209], meerut: [28.9845, 77.7064],
}

function locate(text) {
  const t = text.toLowerCase()
  const key = Object.keys(places).sort((a, b) => b.length - a.length).find((k) => t.includes(k))
  const base = key ? places[key] : [28.6139, 77.209]
  const j = () => (Math.random() - 0.5) * (key ? 0.02 : 0.25) // small jitter, bigger if unknown
  return [base[0] + j(), base[1] + j()]
}

export default function JoinForm({ onAdd }) {
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [info, setInfo] = useState({ name: '', n: 0 })
  const [added, setAdded] = useState(0)

  async function onSubmit(e) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name')).trim()
    const location = String(data.get('location')).trim()
    if (!name || !location) return // `required` allows whitespace-only
    setStatus('sending')

    try {
      if (!data.get('website')) {
        // honeypot empty => real visitor
        if (ENDPOINT) {
          await fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(data) })
        } else {
          await new Promise((r) => setTimeout(r, 900)) // demo mode
        }
        const detail = { pos: locate(location), text: `Breath added from ${location} by ${name}` }
        try {
          const saved = JSON.parse(window.localStorage.getItem('breaths:custom') || '[]')
          saved.push({ pos: detail.pos, text: detail.text, ts: Date.now() })
          window.localStorage.setItem('breaths:custom', JSON.stringify(saved))
        } catch (err) {
          // ignore localStorage errors
        }
        if (typeof onAdd === 'function') {
          onAdd(detail)
        } else {
          window.dispatchEvent(new CustomEvent('breath:add', { detail }))
        }
        setAdded((a) => a + 1)
      }

      // Compute total count: base + persisted local + remote (if available)
      try {
        const localSaved = JSON.parse(window.localStorage.getItem('breaths:custom') || '[]').length
        let remoteCount = 0
        if (ENDPOINT) {
          try {
            const r = await fetch(ENDPOINT)
            const j = await r.json()
            const records = Array.isArray(j) ? j : Array.isArray(j.rows) ? j.rows : j.data || []
            remoteCount = records.length
          } catch (e) {
            remoteCount = 0
          }
        }
        setInfo({ name, n: BASE_COUNT + localSaved + remoteCount })
      } catch (err) {
        setInfo({ name, n: BASE_COUNT + added + 1 })
      }
      setStatus('done')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <form id="breaths-form" onSubmit={onSubmit}>
      <label htmlFor="f-name">First name</label>
      <input id="f-name" name="name" required placeholder="Your name" />

      <label htmlFor="f-loc">Where in Delhi NCR are you based?</label>
      <input id="f-loc" name="location" required placeholder="e.g. Dwarka, Noida, Gurugram, Ghaziabad" />

      <label htmlFor="f-role">Which best describes you?</label>
      <select id="f-role" name="role" required defaultValue="">
        <option value="">Choose one</option>
        <option>Student</option>
        <option>Working professional</option>
        <option>Founder / business owner</option>
        <option>Parent / caregiver</option>
        <option>Outdoor / field worker</option>
        <option>Researcher / practitioner</option>
        <option>Other</option>
      </select>

      <label htmlFor="f-story">What does Delhi&apos;s air change about your life?</label>
      <textarea id="f-story" name="story" placeholder="One sentence is enough." />

      <label htmlFor="f-contact">Email or WhatsApp</label>
      <input id="f-contact" name="contact" required placeholder="One way to contact you" />

      {/* Honeypot: hidden from people, bots fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'COUNTING YOUR BREATH…' : 'COUNT ME IN'}
      </button>

      <div id="success" role="status" aria-live="polite" style={{ display: status === 'done' || status === 'error' ? 'block' : 'none', marginTop: 12, fontWeight: 800, color: status === 'error' ? '#a11' : '#17662d' }}>
        {status === 'done' && (
          <>
            Thanks, {info.name}. Your breath is #{info.n.toLocaleString('en-US')}.{' '}
            <a onClick={() => document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' })}>See it on the map</a>
          </>
        )}
        {status === 'error' && 'Something went wrong. Please check your connection and try again.'}
      </div>

      {!ENDPOINT && (
        <div style={{ fontSize: 12, color: '#5e6668', marginTop: 10 }}>
          Demo mode: set NEXT_PUBLIC_SHEET_ENDPOINT to save responses to Google Sheets.
        </div>
      )}
    </form>
  )
}
