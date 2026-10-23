import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Menu, X, Pause, Play } from 'lucide-react'

const films = [
  { id: 'headphones', name: 'Audio', title: <>Your taste.<br />Your storefront.</>, description: 'Turn your recommendations into a shopping destination that feels entirely yours.', note: 'Sound, curated.', category: 'Headphones', detail: 'A closer look at the things worth sharing.' },
  { id: 'fragrance', name: 'Fragrance', title: <>Leave an<br />impression.</>, description: 'Give every recommendation its own story. Bring fragrance, fashion and everyday finds into one considered collection.', note: 'A signature, bottled.', category: 'Fragrance', detail: 'Build a collection around your point of view.' },
  { id: 'watch', name: 'Watches', title: <>Make every<br />detail matter.</>, description: 'An editorial storefront gives your audience the context behind your choices, from the first impression to the finer details.', note: 'Time, considered.', category: 'Watches', detail: 'Let your eye for detail do the talking.' },
  { id: 'sneaker', name: 'Footwear', title: <>Move beyond<br />the link.</>, description: 'Connect footwear, accessories and the rest of your world. Help people discover the next thing they will love.', note: 'A different perspective.', category: 'Footwear', detail: 'One destination for everything you recommend.' },
  { id: 'camera', name: 'Cameras', title: <>Frame your<br />own world.</>, description: 'Your products. Your perspective. One branded home for your affiliate links, with purchases handled by the original retailers.', note: 'Made for your vision.', category: 'Cameras', detail: 'Start with your taste. Make it your own.' },
]
const clamp = (n: number) => Math.max(0, Math.min(1, n))

export function Hero() {
  const stage = useRef<HTMLDivElement>(null)
  const chapters = useRef<(HTMLElement | null)[]>([])
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const progressRef = useRef(0)
  const [active, setActive] = useState(0)
  const [menu, setMenu] = useState(false)
  const [still, setStill] = useState(false)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const [ready, setReady] = useState<Record<string, boolean>>({})

  const clipCache = useRef(new Map<string, string>())
  const [sources, setSources] = useState<Record<string, string>>({})
  const userInteracted = useRef(false)

  // Blob-backed clips remain seekable on hosts without HTTP range support.
  useEffect(() => {
    if (still) return
    const controller = new AbortController()
    films.filter((_, index) => Math.abs(index - active) <= 1).forEach(film => {
      if (clipCache.current.has(film.id)) return
      fetch(`/films/${film.id}.mp4`, { signal: controller.signal })
        .then(response => { if (!response.ok) throw new Error('Film unavailable'); return response.blob() })
        .then(blob => {
          if (controller.signal.aborted) return
          const source = URL.createObjectURL(blob)
          clipCache.current.set(film.id, source)
          setSources(previous => ({ ...previous, [film.id]: source }))
        })
        .catch(() => { if (!controller.signal.aborted) setFailed(previous => ({ ...previous, [film.id]: true })) })
    })
    return () => controller.abort()
  }, [active, still])

  useEffect(() => {
    const cache = clipCache.current
    const prime = () => {
      userInteracted.current = true
      videos.current.forEach(video => {
        if (video?.readyState && !video.dataset.primed) {
          video.dataset.primed = 'true'
          video.play().then(() => video.pause()).catch(() => {})
        }
      })
    }
    window.addEventListener('pointerdown', prime, { once: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', prime)
      cache.forEach(source => URL.revokeObjectURL(source))
      cache.clear()
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setStill(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    let raf = 0
    let previous = performance.now()
    let eased = progressRef.current
    let lastActive = -1
    let visible = true
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting }, { rootMargin: '100px' })
    if (stage.current) observer.observe(stage.current)
    const tick = (now: number) => {
      const dt = Math.min(now - previous, 64)
      previous = now
      if (visible && !document.hidden) {
        let index = 0
        for (let i = 0; i < chapters.current.length; i++) {
          const chapter = chapters.current[i]
          if (chapter && chapter.getBoundingClientRect().top <= window.innerHeight * 0.1) index = i
        }
        const chapter = chapters.current[index]
        if (chapter) {
          const rect = chapter.getBoundingClientRect()
          const target = clamp(-rect.top / Math.max(1, rect.height - window.innerHeight * (index === films.length - 1 ? 1 : 0.15)))
          if (lastActive !== index) {
            eased = target
            lastActive = index
            setActive(index)
          }
          eased += (target - eased) * (1 - Math.exp(-dt / 85))
          if (Math.abs(target - eased) < 0.0005) eased = target
          progressRef.current = eased
          const video = videos.current[index]
          // Only one seek is in flight: repeatedly overwriting currentTime interrupts decoding.
          if (!still && video && video.readyState >= 2 && !video.seeking && Number.isFinite(video.duration)) {
            const time = eased * Math.max(0, video.duration - 0.05)
            if (Math.abs(video.currentTime - time) > 1 / 45) video.currentTime = time
          }
        }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); observer.disconnect() }
  }, [still])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenu(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const start = () => {
    window.dispatchEvent(new CustomEvent('select-onboarding-intent', { detail: 'free_prototype' }))
    document.getElementById('contact')?.scrollIntoView({ behavior: still ? 'instant' : 'smooth' })
    setMenu(false)
  }

  return (
    <>
      <a className="skip-link" href="#services">Skip the product films</a>
      <header className="site-header">
        <a className="wordmark" href="#hero" aria-label="Monolith home">monolith<span aria-hidden="true">®</span></a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#portfolio">Experience</a><a href="#services">Capabilities</a><a href="#pricing">Ownership</a>
        </nav>
        <button className="header-cta" onClick={start}>Build your store <ArrowUpRight size={16} aria-hidden="true" /></button>
        <button className="menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="mobile-navigation" aria-label={menu ? 'Close navigation' : 'Open navigation'}>{menu ? <X /> : <Menu />}</button>
        {menu && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <a href="#portfolio" onClick={() => setMenu(false)}>Experience</a><a href="#services" onClick={() => setMenu(false)}>Capabilities</a><a href="#pricing" onClick={() => setMenu(false)}>Ownership</a><button onClick={start}>Build your store ↗</button>
        </nav>}
      </header>
      <div className="film-experience" ref={stage} id="portfolio">
        <div className="film-narrative">
          {films.map((film, index) => <article key={film.id} ref={el => { chapters.current[index] = el }} className="film-chapter" id={`chapter-${film.id}`}>
            <div className="chapter-copy">
              {index === 0 ? <h1>{film.title}</h1> : <h2>{film.title}</h2>}
              <p>{film.description}</p>
              <button className="primary-action" onClick={start}>Create your store <ArrowUpRight size={19} aria-hidden="true" /></button>
              <span className="chapter-caption">{film.detail}</span>
            </div>
            <div className="scroll-invitation"><ArrowDown size={16} aria-hidden="true" /><span>{index === 4 ? 'Discover the possibilities' : 'Scroll to bring it together'}</span></div>
          </article>)}
        </div>
        <div className="film-stage" aria-label="Scroll-controlled product films">
          <div className="film-window">
            {films.map((film, index) => <div className={`film-layer ${active === index ? 'is-active' : ''}`} key={film.id} aria-hidden={active !== index}>
              <img className="film-poster" src={`/films/${film.id}.jpg`} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === 0 ? 'eager' : 'lazy'} />
              {!still && Math.abs(active - index) <= 1 && !failed[film.id] && sources[film.id] && <video ref={el => { videos.current[index] = el }} className={ready[film.id] ? 'is-ready' : ''} src={sources[film.id]} poster={`/films/${film.id}.jpg`} muted playsInline preload={index === active ? 'auto' : 'metadata'} onLoadedData={event => {
                const video = event.currentTarget
                setReady(previous => ({ ...previous, [film.id]: true }))
                if (userInteracted.current && !video.dataset.primed) {
                  video.dataset.primed = 'true'
                  video.play().then(() => video.pause()).catch(() => {})
                }
              }} onError={() => setFailed(prev => ({ ...prev, [film.id]: true }))} aria-label={`${film.category} assembly film controlled by scrolling`} />}
            </div>)}
          </div>
          <button className="film-motion-control" aria-label={still ? 'Enable product motion' : 'Show still images'} aria-pressed={still} onClick={() => setStill(!still)}>{still ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
          {failed[films[active].id] && <span className="sr-only" role="status">Showing a product still because the film could not load.</span>}
        </div>
      </div>
    </>
  )
}
