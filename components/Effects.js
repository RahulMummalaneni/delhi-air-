'use client'
import { useEffect } from 'react'

// Scroll progress bar, reveal-on-scroll, count-up numbers and goal-card tilt.
export default function Effects() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const undo = []

    // Scroll progress
    const bar = document.getElementById('progress')
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%'
    }
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    undo.push(() => removeEventListener('scroll', onScroll))

    // Reveal on scroll (outermost matching elements only)
    const sel = '.hero > *, .kicker, section h2, .lead, .why-card, .stage, .card, .pullquote, .breath-stats, #map, .founder-grid > *, .signup > *'
    const all = [...document.querySelectorAll(sel)]
    const els = all.filter((el) => !all.some((o) => o !== el && o.contains(el)))
    if (!reduced) {
      const timers = []
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            const el = e.target
            el.classList.add('in')
            io.unobserve(el)
            timers.push(
              setTimeout(() => {
                el.classList.remove('reveal', 'in')
                el.style.transitionDelay = ''
                if (el.id === 'map') window.dispatchEvent(new Event('resize'))
              }, 1100)
            )
          }),
        { threshold: 0.12 }
      )
      els.forEach((el, i) => {
        el.classList.add('reveal')
        el.style.transitionDelay = (i % 4) * 70 + 'ms'
        io.observe(el)
      })
      undo.push(() => {
        io.disconnect()
        timers.forEach(clearTimeout)
        els.forEach((el) => {
          el.classList.remove('reveal', 'in')
          el.style.transitionDelay = ''
        })
      })
    }

    // Count-up numbers
    document.querySelectorAll('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count)
      const fmt = (n) => Math.round(n).toLocaleString('en-US')
      if (reduced) return
      el.textContent = '0'
      let raf
      const co = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return
            co.disconnect()
            const t0 = performance.now()
            const tick = (t) => {
              const p = Math.min((t - t0) / 1600, 1)
              el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)))
              if (p < 1) raf = requestAnimationFrame(tick)
            }
            raf = requestAnimationFrame(tick)
          }),
        { threshold: 0.6 }
      )
      co.observe(el)
      undo.push(() => {
        co.disconnect()
        cancelAnimationFrame(raf)
        el.textContent = fmt(to)
      })
    })

    // Goal card tilt
    const goal = document.querySelector('.goal-card')
    if (goal && !reduced && matchMedia('(hover:hover)').matches) {
      const move = (e) => {
        const r = goal.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        goal.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
      }
      const leave = () => (goal.style.transform = '')
      goal.addEventListener('mousemove', move)
      goal.addEventListener('mouseleave', leave)
      undo.push(() => {
        goal.removeEventListener('mousemove', move)
        goal.removeEventListener('mouseleave', leave)
      })
    }

    return () => undo.forEach((f) => f())
  }, [])

  return <div id="progress" />
}
