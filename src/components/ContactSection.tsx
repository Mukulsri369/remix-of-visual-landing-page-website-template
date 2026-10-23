import { useEffect } from 'react'
import { Contact } from './Contact'
import { Toaster } from './ui/toaster'
import type { OnboardingIntent } from '@/lib/pricing'

export default function ContactSection({ initialIntent, navigateTo }: { initialIntent: OnboardingIntent; navigateTo: 'contact' | 'samples' | null }) {
  useEffect(() => {
    if (!navigateTo) return
    const frame = requestAnimationFrame(() => document.getElementById(navigateTo)?.scrollIntoView({ behavior: 'instant' }))
    return () => cancelAnimationFrame(frame)
  }, [navigateTo, initialIntent])
  return <><Contact initialIntent={initialIntent} /><Toaster /></>
}
