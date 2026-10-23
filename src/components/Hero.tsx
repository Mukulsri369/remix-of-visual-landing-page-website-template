import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { advanceMotion } from '@/lib/scroll-motion'
import { createVideoScrubber } from '@/lib/video-scrubber'
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
  const bindVideos = useMemo(() => films.map((_, index) => (element: HTMLVideoElement | null) => {
    const previous = videos.current[index]
    if (!element && previous) queueMicrotask(() => {
      // A ref can be rebound during a development refresh without unmounting.
      if (previous.isConnected) return
      previous.pause()
      previous.removeAttribute('src')
      previous.load() // Release the decoder and cancel an unfinished network stream.
    })
    videos.current[index] = element
  }), [])
  const progressRef = useRef(0)
  const [active, setActive] = useState(0)
  const [inView, setInView] = useState(true)
  const [menu, setMenu] = useState(false)
  const [still, setStill] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [failed, setFailed] = useState<Record<string, boolean>>({})
  const scrubber = useRef<{ index: number; player: ReturnType<typeof createVideoScrubber> } | null>(null)
  const [warm, setWarm] = useState(-1)
  const warmed = useRef(-1)
  const [ready, setReady] = useState<Record<string, boolean>>({})

  const userInteracted = useRef(false)

  // Stream the visible clip immediately. No full-file Blob download or competing
  // neighbour downloads before the first frame can appear.
  useLayoutEffect(() => {
    const video = videos.current[active]
    if (still || !inView || !video) return
    setReady(previous => ({ ...previous, [films[active].id]: false }))
    let announced = false
    const player = createVideoScrubber(video, () => {
      if (announced) return
      announced = true
      setReady(previous => previous[films[active].id] ? previous : { ...previous, [films[active].id]: true })
    })
    scrubber.current = { index: active, player }
    player.update(progressRef.current)
    return () => { player.dispose(); scrubber.current = null; video.pause() }
  }, [active, still, inView])

  useEffect(() => {
    const prime = () => {
      userInteracted.current = true
      const video = videos.current.find(item => item?.getAttribute('data-active') === 'true')
      if (video && !video.dataset.primed) {
        video.dataset.primed = 'true'
        video.play().then(() => {
          video.pause()
          scrubber.current?.player.update(progressRef.current, true)
        }).catch(() => {})
      }
    }
    window.addEventListener('pointerdown', prime, { passive: true })
    window.addEventListener('touchstart', prime, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('touchstart', prime)
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
    let disposed = false
    let previous = performance.now()
    let motion = { position: progressRef.current, velocity: 0 }
    let geometry: { top: number; height: number }[] = []
    let viewportHeight = window.innerHeight
    let lastActive = -1
    let visible = true
    const wake = () => {
      if (!disposed && !raf && visible && !document.hidden) {
        previous = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    const measure = () => {
      geometry = chapters.current.map(chapter => {
        const rect = chapter?.getBoundingClientRect()
        return { top: (rect?.top ?? 0) + window.scrollY, height: rect?.height ?? 1 }
      })
      // Keep the stable layout viewport on phones. URL-bar collapse must not
      // change the film position halfway through a swipe.
      const display = stage.current?.querySelector<HTMLElement>('.film-stage')
      viewportHeight = display ? display.offsetHeight + Number.parseFloat(getComputedStyle(display).top) : window.innerHeight
      wake()
    }
    const tick = (now: number) => {
      raf = 0
      const dt = Math.min(now - previous, 64)
      previous = now
      if (!visible || document.hidden) return
      let index = 0
      for (let i = 0; i < geometry.length; i++) {
        if (geometry[i].top - window.scrollY <= viewportHeight * 0.1) index = i
      }
      const chapter = geometry[index]
      if (!chapter) return
      const target = clamp((window.scrollY - chapter.top) / Math.max(1, chapter.height - viewportHeight * (index === films.length - 1 ? 1 : 0.15)))
      if (lastActive !== index) {
        motion = { position: target, velocity: 0 }
        lastActive = index
        setActive(index)
      }
      motion = advanceMotion(motion, target, dt / 1000)
      progressRef.current = motion.position
      if (!still && scrubber.current?.index === index) scrubber.current.player.update(motion.position)
      // Metadata for just the next film, and only once the current film is well
      // underway. Save-Data and slow connections reserve bandwidth for this film.
      const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
      if (!still && target > 0.65 && index < films.length - 1 && warmed.current !== index + 1 &&
          !connection?.saveData && !['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')) {
        warmed.current = index + 1
        setWarm(index + 1)
      }
      if (!still && (Math.abs(motion.position - target) > 0.00001 || Math.abs(motion.velocity) > 0.0001)) {
        raf = requestAnimationFrame(tick)
      }
    }
    measure()
    const resize = new ResizeObserver(measure)
    if (stage.current) resize.observe(stage.current)
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      setInView(visible)
      if (visible) wake()
    }, { rootMargin: '100px' })
    if (stage.current) observer.observe(stage.current)
    // Passive native scrolling; no wheel/touch interception and no idle RAF loop.
    window.addEventListener('scroll', wake, { passive: true })
    window.addEventListener('resize', measure)
    document.addEventListener('visibilitychange', wake)
    document.fonts.ready.then(() => { if (stage.current) measure() })
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('scroll', wake)
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', wake)
    }
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
              {(index === active || index === active - 1 || index === warm) && <img className="film-poster" src={`/films/${film.id}.jpg`} alt="" fetchPriority={index === 0 ? 'high' : 'auto'} loading={index === active ? 'eager' : 'lazy'} />}
              {!still && inView && (active === index || (warm === index && index === active + 1)) && !failed[film.id] && <video
                ref={bindVideos[index]}
                data-active={active === index}
                className={ready[film.id] ? 'is-ready' : ''}
                src={`/films/${film.id}.mp4`}
                poster={`/films/${film.id}.jpg`}
                muted playsInline disablePictureInPicture
                preload={index === active ? 'auto' : 'metadata'}
                onLoadedData={event => {
                  const video = event.currentTarget
                  if (index !== active) return
                  scrubber.current?.player.update(progressRef.current)
                  if (userInteracted.current && !video.dataset.primed) {
                    video.dataset.primed = 'true'
                    video.play().then(() => {
                      video.pause()
                      if (scrubber.current?.index === index) scrubber.current.player.update(progressRef.current, true)
                    }).catch(() => {})
                  }
                }}
                onError={() => setFailed(prev => ({ ...prev, [film.id]: true }))}
                aria-label={`${film.category} assembly film controlled by scrolling`} />}
            </div>)}
          </div>
          <button className="film-motion-control" aria-label={still ? 'Enable product motion' : 'Show still images'} aria-pressed={still} onClick={() => setStill(!still)}>{still ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}</button>
          {failed[films[active].id] && <span className="sr-only" role="status">Showing a product still because the film could not load.</span>}
        </div>
      </div>
    </>
  )
}
