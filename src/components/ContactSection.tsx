import { Contact } from './Contact'
import { Toaster } from './ui/toaster'
import type { OnboardingIntent } from '@/lib/pricing'

export default function ContactSection({ initialIntent }: { initialIntent: OnboardingIntent }) {
  return <><Contact initialIntent={initialIntent} /><Toaster /></>
}
