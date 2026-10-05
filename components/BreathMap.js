'use client'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

const ENDPOINT = process.env.NEXT_PUBLIC_SHEET_ENDPOINT || ''

const places = {
  dwarka: [28.5921, 77.046], noida: [28.5355, 77.391], 'greater noida': [28.4744, 77.504],
  gurugram: [28.4595, 77.0266], gurgaon: [28.4595, 77.0266], faridabad: [28.4089, 77.3178],
  ghaziabad: [28.6692, 77.4538], indirapuram: [28.646, 77.369], 'vasant kunj': [28.52, 77.158],
  saket: [28.5245, 77.2066], rohini: [28.7495, 77.0565], janakpuri: [28.6219, 77.0878],
  'lajpat nagar': [28.5677, 77.243], 'connaught place': [28.6315, 77.2167], 'mayur vihar': [28.6082, 77.2955],
  'karol bagh': [28.6519, 77.1909], pitampura: [28.7007, 77.131], delhi: [28.6139, 77.209], meerut: [28.9845, 77.7064],
}

function locate(text) {
  const t = String(text || '').toLowerCase()
  const key = Object.keys(places).sort((a, b) => b.length - a.length).find((k) => t.includes(k))
  const base = key ? places[key] : [28.6139, 77.209]
  const j = () => (Math.random() - 0.5) * (key ? 0.02 : 0.25)
  return [base[0] + j(), base[1] + j()]
}

const breaths = [
  [28.6139, 77.209, 'Delhi'],
  [28.621, 77.088, 'Dwarka'],
  [28.5494, 77.2001, 'South Delhi'],
  [28.7041, 77.1025, 'North Delhi'],
  [28.5355, 77.391, 'Noida'],
  [28.567, 77.321, 'Noida Extension'],
  [28.4595, 77.0266, 'Gurugram'],
  [28.4089, 77.3178, 'Faridabad'],
  [28.6692, 77.4538, 'Ghaziabad'],
  [28.9845, 77.7064, 'Meerut road corridor'],
]

export default function BreathMap() {
  useEffect(() => {
    let map
    let cancelled = false
    let onAdd
    const timers = []
    let remoteCount = 0
    let localCount = 0
    const baseCount = breaths.length

    function updateTotals() {
      const total = baseCount + (remoteCount || 0) + (localCount || 0)
      const el = document.getElementById('total-count')
      if (el) el.textContent = String(total).toLocaleString('en-US')
    }

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

      map = L.map('map', { scrollWheelZoom: false }).setView([28.61, 77.2], 9)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map)

      const icon = (cls = '') =>
        L.divIcon({
          className: '',
          html: `<div class="lung-icon ${cls}">🫁</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        })

      breaths.forEach(([lat, lng, place]) =>
        L.marker([lat, lng], { icon: icon() }).addTo(map).bindPopup('Breath added from ' + place)
      )

      // Fetch central breaths from configured endpoint (Google Sheets / Apps Script JSON)
      const seenRemote = new Set()
      async function fetchRemote() {
        if (!ENDPOINT) return
        try {
          const endpoint = process.env.NEXT_PUBLIC_SUPABASE === '1' ? '/api/breaths' : ENDPOINT
          const res = await fetch(endpoint)
          const json = await res.json()
          const records = Array.isArray(json) ? json : Array.isArray(json.rows) ? json.rows : json.data || []
          // add new records only
          records.forEach((r) => {
            const lat = r.lat || r.latitude || r.Lat || r.Latitude
            const lng = r.lng || r.lon || r.lng || r.longitude || r.Longitude
            let pos
            if (Array.isArray(r.pos) && r.pos.length >= 2) pos = r.pos
            else if (lat && lng) pos = [Number(lat), Number(lng)]
            else {
              const loc = r.location || r.place || r.city || r.text || r.name || r.location_raw || ''
              pos = locate(loc)
            }
            const text = r.text || r.story || r.name || r.place || (r.location || '')
            const id = r.id || r._id || r.ts || r.timestamp || `${pos[0]}_${pos[1]}_${String(text || '').slice(0,50)}`
            if (seenRemote.has(id)) return
            seenRemote.add(id)
            const pop = document.createElement('div')
            pop.textContent = text || 'Breath added'
            L.marker(pos, { icon: icon('new') }).addTo(map).bindPopup(pop)
          })
          remoteCount = records.length
          updateTotals()
        } catch (err) {
          // ignore endpoint errors
        }
      }

      // initial fetch + polling every 15s
      await fetchRemote()
      const pollId = setInterval(fetchRemote, 15000)

      // Realtime subscription via Supabase (instant updates for inserts)
      let realtimeChannel
      if (
        process.env.NEXT_PUBLIC_SUPABASE === '1' &&
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON
      ) {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON)
          realtimeChannel = supabase
            .channel('public:breaths')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'breaths' }, (payload) => {
              try {
                const r = payload.new || payload.record || {}
                const lat = r.lat || r.latitude || r.Lat || r.Latitude
                const lng = r.lng || r.lon || r.lng || r.longitude || r.Longitude
                let pos
                if (Array.isArray(r.pos) && r.pos.length >= 2) pos = r.pos
                else if (lat && lng) pos = [Number(lat), Number(lng)]
                else pos = locate(r.location || r.place || r.text || r.name || '')
                const text = r.text || r.story || r.name || r.place || (r.location || '')
                const id = r.id || r._id || r.ts || r.timestamp || `${pos[0]}_${pos[1]}_${String(text || '').slice(0,50)}`
                if (seenRemote.has(id)) return
                seenRemote.add(id)
                const pop = document.createElement('div')
                pop.textContent = text || 'Breath added'
                L.marker(pos, { icon: icon('new') }).addTo(map).bindPopup(pop)
                remoteCount = (remoteCount || 0) + 1
                updateTotals()
              } catch (e) {
                // ignore
              }
            })
            .subscribe()
        } catch (err) {
          // ignore realtime setup errors
        }
      }

      // Scroll-zoom only after clicking the map
      map.on('click', () => map.scrollWheelZoom.enable())
      map.getContainer().addEventListener('mouseleave', () => map.scrollWheelZoom.disable())

      // Load persisted custom breaths from localStorage
      try {
        const saved = JSON.parse(window.localStorage.getItem('breaths:custom') || '[]')
        localCount = saved.length
        saved.forEach(({ pos, text }) => {
          const pop = document.createElement('div')
          pop.textContent = text
          L.marker(pos, { icon: icon('new') }).addTo(map).bindPopup(pop)
        })
      } catch (err) {
        localCount = 0
      }

      // Update the displayed totals now that we've loaded all sources
      updateTotals()

      // New breaths from the form
      onAdd = (e) => {
        const { pos, text } = e.detail
        const pop = document.createElement('div')
        pop.textContent = text // textContent: user input is never parsed as HTML
        const m = L.marker(pos, { icon: icon('new') }).addTo(map).bindPopup(pop)
        map.flyTo(pos, 11, { duration: reduced ? 0 : 1.6 })
        timers.push(setTimeout(() => m.openPopup(), reduced ? 0 : 1700))
        try {
          const saved = JSON.parse(window.localStorage.getItem('breaths:custom') || '[]')
          localCount = saved.length
        } catch (err) {
          // ignore
        }
        updateTotals()
      }
      window.addEventListener('breath:add', onAdd)
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      if (onAdd) window.removeEventListener('breath:add', onAdd)
      if (map) map.remove()
    }
  }, [])

  return <div id="map" style={{ height: '480px', minHeight: '320px' }} />
}
