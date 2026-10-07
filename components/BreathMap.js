'use client'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

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

export default function BreathMap() {
  useEffect(() => {
    let map
    let cancelled = false
    let onAdd
    let pollId
    const timers = []
    let remoteCount = 0

    function updateTotals() {
      const el = document.getElementById('total-count')
      if (el) el.textContent = String(remoteCount).toLocaleString('en-US')
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
          html: `<div class="lung-icon ${cls}"><span aria-hidden="true">🫁</span><span class="lung-heart" aria-hidden="true">♥</span></div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        })

      const seenRemote = new Set()
      function addRemoteMarker(record) {
        if (!record || typeof record !== 'object') return null
        const lat = Number(record.lat ?? record.latitude ?? record.pos?.[0])
        const lng = Number(record.lng ?? record.longitude ?? record.pos?.[1])
        const pos = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : locate(record.location || '')
        const id = String(record._id || record.id || record.ts || `${pos[0]}_${pos[1]}`)
        if (seenRemote.has(id)) return null
        seenRemote.add(id)
        const pop = document.createElement('div')
        pop.textContent = record.text || `Breath added from ${record.location || 'Delhi NCR'}`
        return L.marker(pos, { icon: icon('new') }).addTo(map).bindPopup(pop)
      }

      async function fetchRemote() {
        try {
          const res = await fetch('/api/breaths')
          const json = await res.json()
          if (!res.ok) throw new Error('Unable to load saved breaths')
          const records = Array.isArray(json) ? json : Array.isArray(json.records) ? json.records : []
          records.forEach(addRemoteMarker)
          remoteCount = Number.isFinite(json.count) ? json.count : records.length
          updateTotals()
        } catch (err) {
          // ignore endpoint errors
        }
      }

      // initial fetch + polling every 15s
      await fetchRemote()
      pollId = setInterval(fetchRemote, 15000)

      // Scroll-zoom only after clicking the map
      map.on('click', () => map.scrollWheelZoom.enable())
      map.getContainer().addEventListener('mouseleave', () => map.scrollWheelZoom.disable())

      updateTotals()

      // New breaths from the form
      onAdd = (e) => {
        const detail = e.detail || {}
        const record = detail.record || detail
        const marker = addRemoteMarker(record)
        remoteCount = Number.isFinite(detail.count) ? detail.count : remoteCount + 1
        updateTotals()
        const pos = marker?.getLatLng() || locate(record.location || '')
        map.flyTo(pos, 11, { duration: reduced ? 0 : 1.6 })
        if (marker) timers.push(setTimeout(() => marker.openPopup(), reduced ? 0 : 1700))
      }
      window.addEventListener('breath:add', onAdd)
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      if (pollId) clearInterval(pollId)
      if (onAdd) window.removeEventListener('breath:add', onAdd)
      if (map) map.remove()
    }
  }, [])

  return <div id="map" style={{ height: '480px', minHeight: '320px' }} />
}
