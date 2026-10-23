import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight, RotateCcw, Play } from 'lucide-react'

const storefronts = [
  { id: 'sample-1', name: 'Fresh Canvas Foundry', category: 'Flowers & local delivery', url: 'https://fresh-canvas-foundry.lovable.app' },
  { id: 'sample-2', name: 'Remix Mosaic Maker', category: 'Ceramics & crafted objects', url: 'https://remix-mosaic-maker.lovable.app' },
  { id: 'sample-3', name: 'Remix & Ripple', category: 'Art & exhibitions', url: 'https://remix-and-ripple.lovable.app' },
  { id: 'sample-4', name: 'Paws Find Forever Homes', category: 'Community & animal care', url: 'https://paws-find-forever-homes.lovable.app' },
  { id: 'sample-5', name: 'Linea Minimalist Shopfront', category: 'Jewellery & accessories', url: 'https://linea-minimalist-shopfront.lovable.app' },
  { id: 'sample-6', name: 'Our Visible Universe', category: 'Space & discovery', url: 'https://ourvisibleuniverse.shop' },
]

function StorefrontPreview({ site, reduced }: { site: typeof storefronts[number]; reduced: boolean }) {
  const windowRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [travel, setTravel] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const measure = () => {
    if (windowRef.current && imageRef.current) setTravel(Math.max(0, imageRef.current.getBoundingClientRect().height - windowRef.current.clientHeight))
  }
  useEffect(() => {
    const observer = new ResizeObserver(measure)
    if (windowRef.current) observer.observe(windowRef.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => { if (reduced) setPlaying(false) }, [reduced])
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) setPlaying(false) })
    if (windowRef.current) observer.observe(windowRef.current)
    const hide = () => { if (document.hidden) setPlaying(false) }
    document.addEventListener('visibilitychange', hide)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', hide) }
  }, [])
  const moving = playing && !reduced && loaded && travel > 0
  const style = { '--preview-travel': `${-travel}px`, '--preview-duration': `${Math.max(7, Math.min(26, travel / 90))}s` } as CSSProperties
  return <article className="storefront-preview" data-playing={moving} style={style}
    onPointerLeave={event => { if (event.pointerType === 'mouse') setPlaying(false) }}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPlaying(false) }}>
    <div className="preview-mount">
      <div className="preview-chrome" data-ui><span>{new URL(site.url).hostname}</span><a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${site.name} in a new tab`}><ArrowUpRight size={18} aria-hidden="true" /></a></div>
      <div className="preview-window" ref={windowRef} onPointerEnter={event => { if (event.pointerType === 'mouse' && !reduced) setPlaying(true) }}>
        {!failed && <img ref={imageRef} className="preview-page" src={`/previews/${site.id}.webp`} srcSet={`/previews/${site.id}-small.webp 640w, /previews/${site.id}.webp 1280w`} sizes="(max-width: 700px) calc(100vw - 64px), (max-width: 1000px) calc(50vw - 60px), calc(50vw - 96px)" alt={`${site.name} website preview`} loading="lazy" decoding="async" onLoad={() => { setLoaded(true); measure() }} onError={() => setFailed(true)} />}
        {!loaded && <div className="preview-placeholder">{failed ? 'Visit the storefront to explore.' : 'Preparing the preview...'}</div>}
      </div>
    </div>
    <div className="preview-caption"><div><h3><a href={site.url} target="_blank" rel="noopener noreferrer">{site.name}<span className="sr-only"> (opens in a new tab)</span></a></h3><p>{site.category}</p></div>
      {!reduced && <button type="button" className="preview-control" disabled={!loaded || failed || travel < 1} aria-label={`${playing ? 'Reset' : 'Play'} scrolling preview for ${site.name}`} aria-pressed={moving} onClick={() => setPlaying(value => !value)}>{moving ? <RotateCcw size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}<span>{moving ? 'Reset' : 'Preview'}</span></button>}
    </div>
  </article>
}

export function SampleGallery() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return <section className="sample-gallery" id="samples" aria-labelledby="samples-heading">
    <div className="sample-gallery-heading"><h2 id="samples-heading">Explore sample<br />storefronts.</h2><div><p>Six different directions. Find the one that feels like you.</p><span className="sample-gallery-hint">{reduced ? 'Open a storefront for a closer look.' : <><span className="hover-hint">Hover to explore. </span><span className="touch-hint">Tap Preview to explore. </span>Open any storefront for a closer look.<ArrowDown size={16} aria-hidden="true" /></>}</span></div></div>
    <div className="sample-gallery-grid">{storefronts.map(site => <StorefrontPreview key={site.id} site={site} reduced={reduced} />)}</div>
  </section>
}
