import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { OnboardingIntent } from '@/lib/pricing'

const ContactSection = lazy(() => import('./ContactSection'))

export function DeferredContact() {
  const shell = useRef<HTMLDivElement>(null)
  const [load, setLoad] = useState(() => ['#contact', '#samples'].includes(window.location.hash))
  const [navigateTo, setNavigateTo] = useState<'contact' | 'samples' | null>(() => window.location.hash === '#samples' ? 'samples' : window.location.hash === '#contact' ? 'contact' : null)
  const [intent, setIntent] = useState<OnboardingIntent>('free_prototype')
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setLoad(true); observer.disconnect() }
    }, { rootMargin: '900px' })
    if (shell.current) observer.observe(shell.current)
    const select = (event: Event) => {
      const selected = (event as CustomEvent<OnboardingIntent>).detail
      if (['free_prototype', 'free_trial_7d', 'starter', 'creator', 'premium'].includes(selected)) {
        setIntent(selected)
        setNavigateTo('contact')
        setLoad(true)
      }
    }
    window.addEventListener('select-onboarding-intent', select)
    const anchor = () => {
      if (['#contact', '#samples'].includes(window.location.hash)) {
        setNavigateTo(window.location.hash === '#samples' ? 'samples' : 'contact')
        setLoad(true)
      }
    }
    window.addEventListener('hashchange', anchor)
    anchor()
    return () => { observer.disconnect(); window.removeEventListener('select-onboarding-intent', select); window.removeEventListener('hashchange', anchor) }
  }, [])
  const placeholder = <div id="contact" className="contact-loading page-section" role={load ? 'status' : undefined}><h2>Make it unmistakably yours.</h2>{load && <p>Preparing your storefront brief...</p>}</div>
  return <div className="contact-shell" ref={shell}>
    {load ? <Suspense fallback={placeholder}><ContactSection initialIntent={intent} navigateTo={navigateTo} /></Suspense> : placeholder}
  </div>
}
