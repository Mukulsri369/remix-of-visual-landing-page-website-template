import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { CheckCircle2, ExternalLink, Globe, LogIn, LogOut, ShieldCheck, UserPlus, Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  auth,
  db,
  signUpAccount,
  signInAccount,
  signInWithGoogle,
  logOutUser,
  getRememberedSession,
  saveRememberedSession,
  AppAccountSession,
  handleFirestoreError,
  OperationType,
} from '@/lib/firebase'
import { OnboardingIntent } from '@/lib/pricing'

const ONBOARDING_INTENT_LABELS: Record<OnboardingIntent, string> = {
  free_prototype: 'Register for Your Prototype — Absolutely Free',
  free_trial_7d: 'Start Your 7-Day Free Trial',
  starter: 'Starter Plan — ₹599 (One-Time Payment)',
  creator: 'Creator Plan — ₹1,499 (One-Time Payment)',
  premium: 'Premium Plan — ₹3,999 (One-Time Payment · Best for Growing Brands)',
}

const SAMPLE_WEBSITES = [
  {
    id: 'sample-1',
    badge: 'Sample 01 · Creative Studio',
    name: 'Fresh Canvas Foundry',
    url: 'https://fresh-canvas-foundry.lovable.app',
    accent: 'bg-accent-emerald',
  },
  {
    id: 'sample-2',
    badge: 'Sample 02 · Visual Curation',
    name: 'Remix Mosaic Maker',
    url: 'https://remix-mosaic-maker.lovable.app',
    accent: 'bg-accent-blue',
  },
  {
    id: 'sample-3',
    badge: 'Sample 03 · Editorial Motion',
    name: 'Remix & Ripple',
    url: 'https://remix-and-ripple.lovable.app',
    accent: 'bg-accent-purple',
  },
  {
    id: 'sample-4',
    badge: 'Sample 04 · Niche Showcase',
    name: 'Paws Find Forever Homes',
    url: 'https://paws-find-forever-homes.lovable.app',
    accent: 'bg-accent-emerald',
  },
  {
    id: 'sample-5',
    badge: 'Sample 05 · Minimalist Flagship',
    name: 'Linea Minimalist Shopfront',
    url: 'https://linea-minimalist-shopfront.lovable.app',
    accent: 'bg-accent-blue',
  },
]

const COUNTRY_OPTIONS = [
  { id: 'Global (All Countries)', label: 'Global (All Countries)' },
  { id: 'USA ($)', label: 'United States ($)' },
  { id: 'India (₹)', label: 'India (₹)' },
  { id: 'United Kingdom (£)', label: 'United Kingdom (£)' },
  { id: 'European Union (€)', label: 'European Union (€)' },
  { id: 'Canada (CA$)', label: 'Canada (CA$)' },
  { id: 'Australia (A$)', label: 'Australia (A$)' },
  { id: 'UAE & Middle East (AED)', label: 'UAE & Middle East (AED)' },
]

export function Contact() {
  const { toast } = useToast()
  const [account, setAccount] = useState<AppAccountSession | null>(() => getRememberedSession())
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
    rememberMe: true,
  })
  const [authError, setAuthError] = useState('')
  const [isAuthBusy, setIsAuthBusy] = useState(false)
  const [pendingSubmitAfterAuth, setPendingSubmitAfterAuth] = useState(false)

  const [formData, setFormData] = useState({
    onboardingIntent: 'free_prototype' as OnboardingIntent,
    name: '',
    handle: '',
    niche: 'Fashion & Luxury Apparel',
    theme: 'Atelier Luxury (Editorial)',
    selectedCountries: ['Global (All Countries)'] as string[],
    otherCountries: '',
    storeDescription: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Listen for CTA selections from Hero or Pricing sections
  useEffect(() => {
    const handleSelectIntent = (e: Event) => {
      const customEvent = e as CustomEvent<OnboardingIntent>
      if (customEvent.detail && ONBOARDING_INTENT_LABELS[customEvent.detail]) {
        setFormData((prev) => ({
          ...prev,
          onboardingIntent: customEvent.detail,
        }))
      }
    }
    window.addEventListener('select-onboarding-intent', handleSelectIntent)
    return () => window.removeEventListener('select-onboarding-intent', handleSelectIntent)
  }, [])

  // Sync remembered session or Firebase Auth state on load
  useEffect(() => {
    const remembered = getRememberedSession()
    if (remembered) {
      setAccount(remembered)
      setFormData((prev) => ({
        ...prev,
        name: prev.name || remembered.name || '',
      }))
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        const session: AppAccountSession = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          isFirebaseVerified: Boolean(firebaseUser.emailVerified),
        }
        saveRememberedSession(session)
        setAccount(session)
        setFormData((prev) => ({
          ...prev,
          name: prev.name || session.name || '',
        }))
      }
    })
    return () => unsubscribe()
  }, [])

  const toggleCountry = (countryId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedCountries.includes(countryId)
      if (exists) {
        const updated = prev.selectedCountries.filter((c) => c !== countryId)
        return {
          ...prev,
          selectedCountries: updated.length > 0 ? updated : ['Global (All Countries)'],
        }
      } else {
        return {
          ...prev,
          selectedCountries: [...prev.selectedCountries, countryId],
        }
      }
    })
  }

  const executePrototypeSubmission = async (activeSession: AppAccountSession) => {
    const finalName = (formData.name.trim() || activeSession.name || 'Creator').slice(0, 100)
    const finalHandle = formData.handle.trim().slice(0, 255)
    const finalStoreDescription = formData.storeDescription.trim().slice(0, 1500)

    if (!finalName || !finalHandle) {
      toast({
        title: 'Please fill in your name and social handle',
        variant: 'destructive',
      })
      return
    }

    const combinedRegions = [
      ...formData.selectedCountries,
      ...(formData.otherCountries.trim() ? [`Additional: ${formData.otherCountries.trim()}`] : []),
    ]
      .join(', ')
      .slice(0, 500)

    const selectedIntentLabel = ONBOARDING_INTENT_LABELS[formData.onboardingIntent]
    const enrichedDescription = `[Selected Option: ${selectedIntentLabel}] ${
      finalStoreDescription || 'Standard Monolith Storefront setup'
    }`.slice(0, 1500)

    setIsSubmitting(true)

    try {
      // 1. Save to Firestore if signed in with a verified Firebase token
      if (auth.currentUser && auth.currentUser.emailVerified) {
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        const writePath = `prototype_requests/${requestId}`
        try {
          await setDoc(doc(db, 'prototype_requests', requestId), {
            uid: auth.currentUser.uid,
            userEmail: (auth.currentUser.email || activeSession.email).slice(0, 255),
            name: finalName,
            handle: finalHandle,
            niche: formData.niche.slice(0, 100),
            theme: formData.theme.slice(0, 100),
            regions: combinedRegions,
            storeDescription: enrichedDescription,
            createdAt: serverTimestamp(),
          })
        } catch (firestoreErr) {
          const errMsg = firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr)
          if (errMsg.includes('Missing or insufficient permissions')) {
            handleFirestoreError(firestoreErr, OperationType.CREATE, writePath)
          }
          console.warn('Firestore write skipped or restricted:', firestoreErr)
        }
      }

      // 2. Send email notification to mukul.srivastava.025@gmail.com
      try {
        await fetch('https://formsubmit.co/ajax/mukul.srivastava.025@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            _subject: `New Storefront Request (${selectedIntentLabel}) — ${finalName} (${finalHandle})`,
            _template: 'table',
            'Registration / Selected Plan': selectedIntentLabel,
            'Creator Full Name': finalName,
            'Registered User Email': activeSession.email,
            'Social Handle / URL': finalHandle,
            'Creator Niche': formData.niche,
            'Preferred Storefront Style': formData.theme,
            'Target Audience Countries': combinedRegions,
            'Store Looks & Features Description':
              finalStoreDescription || 'No additional custom description provided',
            'Database & Support Policy':
              'Database-dependent product capacity (no artificial plan cap) + Free database setup assistance + 24×7 Support included',
          }),
        })
      } catch (emailErr) {
        console.warn('Email webhook warning:', emailErr)
      }

      // 3. Show confirmation popup
      setShowSuccessModal(true)
      setFormData((prev) => ({
        ...prev,
        handle: '',
        otherCountries: '',
        storeDescription: '',
      }))
    } catch (err) {
      console.error('Prototype submission failed:', err)
      toast({
        title: 'Submission error',
        description: 'Could not submit your request. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')

    if (!authForm.email.trim() || !authForm.password.trim()) {
      setAuthError('Please enter your email and password.')
      return
    }
    if (authMode === 'signup' && !authForm.name.trim()) {
      setAuthError('Please enter your full name to sign up.')
      return
    }
    if (authForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters.')
      return
    }

    setIsAuthBusy(true)
    try {
      let session: AppAccountSession
      if (authMode === 'signup') {
        session = await signUpAccount(authForm.name, authForm.email, authForm.password)
        toast({
          title: 'Account created & remembered!',
          description: `Welcome, ${session.name}! You are now signed in.`,
        })
      } else {
        session = await signInAccount(authForm.email, authForm.password)
        toast({
          title: 'Welcome back!',
          description: `Signed in as ${session.email}.`,
        })
      }

      setAccount(session)
      if (!formData.name.trim() && session.name) {
        setFormData((prev) => ({ ...prev, name: session.name }))
      }
      setShowAuthModal(false)

      if (pendingSubmitAfterAuth) {
        setPendingSubmitAfterAuth(false)
        await executePrototypeSubmission(session)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.'
      setAuthError(msg)
    } finally {
      setIsAuthBusy(false)
    }
  }

  const handleGoogleAuth = async () => {
    setAuthError('')
    setIsAuthBusy(true)
    try {
      const session = await signInWithGoogle()
      setAccount(session)
      if (!formData.name.trim() && session.name) {
        setFormData((prev) => ({ ...prev, name: session.name }))
      }
      toast({
        title: 'Signed in with Google!',
        description: `Connected as ${session.email}`,
      })
      setShowAuthModal(false)
      if (pendingSubmitAfterAuth) {
        setPendingSubmitAfterAuth(false)
        await executePrototypeSubmission(session)
      }
    } catch (err: unknown) {
      console.error('Google Sign-In failed:', err)
      setAuthError('Google popup could not complete. Please use the Email Sign Up / Sign In form above.')
    } finally {
      setIsAuthBusy(false)
    }
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.handle.trim()) {
      toast({
        title: 'Please fill in your name and social handle',
        variant: 'destructive',
      })
      return
    }

    // Require login before requesting prototype
    if (!account) {
      setAuthForm((prev) => ({
        ...prev,
        name: prev.name || formData.name.trim(),
      }))
      setPendingSubmitAfterAuth(true)
      setShowAuthModal(true)
      return
    }

    await executePrototypeSubmission(account)
  }

  const handleSignOut = async () => {
    await logOutUser()
    setAccount(null)
    toast({
      title: 'Signed out',
      description: 'You have been signed out. You can sign back in anytime.',
    })
  }

  return (
    <section id="contact" className="relative py-32 bg-card/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Sample Websites Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Live Storefront Demos · Explore Sample Websites
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="block mb-2">Explore Live Sample Websites.</span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-12">
            Preview 5 live sample websites below to experience different storefront layouts and aesthetics—then request your own tailored prototype for all countries worldwide.
          </p>

          {/* 5 Theme-Matched Sample Website Buttons */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SAMPLE_WEBSITES.map((site) => (
              <a
                key={site.id}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-background clean-border rounded-2xl p-5 subtle-shadow hover:border-foreground hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between text-left cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span className={`w-2 h-2 rounded-full ${site.accent}`} />
                      {site.badge.split(' · ')[0]}
                    </span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                  <div className="font-black text-base text-foreground group-hover:text-accent-blue transition-colors leading-snug mb-1.5">
                    {site.name}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {site.badge.split(' · ')[1]}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    View Sample Site
                  </span>
                  <span className="text-xs font-black text-foreground group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-background clean-border rounded-3xl overflow-hidden elevated-shadow">
            <div className="bg-card/50 px-8 py-6 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-accent-blue block mb-1">
                    Direct Application
                  </span>
                  <h3 className="text-xl font-black text-foreground mb-1">
                    Reserve Your Storefront Build
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Share your creator profile to receive a tailored storefront prototype.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-accent-emerald rounded-full" />
                  <span className="text-sm text-muted-foreground font-medium">
                    Avg. reply: &lt; 20 mins · 12 build slots / month
                  </span>
                </div>
              </div>

              {/* Account Sign-Up / Sign-In Bar */}
              <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {account ? (
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2.5 text-sm">
                      <ShieldCheck className="w-4 h-4 text-accent-emerald shrink-0" />
                      <span className="text-muted-foreground">
                        Signed in as <strong className="text-foreground">{account.name}</strong> ({account.email})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Creator Account Required:</span> Sign up once or sign in—your credentials are remembered automatically.
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup')
                          setAuthError('')
                          setShowAuthModal(true)
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Sign Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin')
                          setAuthError('')
                          setShowAuthModal(true)
                        }}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-card border border-border text-foreground text-xs font-bold hover:bg-accent transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Sign In
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              {/* Registration / Plan Selection */}
              <div>
                <label htmlFor="intake-intent" className="block text-sm font-semibold text-foreground mb-2">
                  Selected Registration / One-Time Plan Option
                </label>
                <select
                  id="intake-intent"
                  value={formData.onboardingIntent}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      onboardingIntent: e.target.value as OnboardingIntent,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                >
                  <option value="free_prototype">
                    Register for Your Prototype — Absolutely Free
                  </option>
                  <option value="free_trial_7d">
                    Start Your 7-Day Free Trial (Experience Live Platform)
                  </option>
                  <option value="starter">
                    Starter Plan — ₹599 One-Time Payment (24×7 Support + Free DB Setup)
                  </option>
                  <option value="creator">
                    Creator Plan — ₹1,499 One-Time Payment (Smart Catalog + Advanced Themes)
                  </option>
                  <option value="premium">
                    Premium Plan — ₹3,999 One-Time Payment (1-Click Refresh + India &amp; US + AI Studio)
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="intake-name" className="block text-sm font-semibold text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    id="intake-name"
                    type="text"
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder="Sarah Jenkins"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="intake-handle" className="block text-sm font-semibold text-foreground mb-2">
                    Primary Social Handle or URL
                  </label>
                  <input
                    id="intake-handle"
                    type="text"
                    maxLength={255}
                    value={formData.handle}
                    onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                    placeholder="@sarah.curates"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="intake-niche" className="block text-sm font-semibold text-foreground mb-2">
                    Creator Niche
                  </label>
                  <select
                    id="intake-niche"
                    value={formData.niche}
                    onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                  >
                    <option value="Fashion & Luxury Apparel">Fashion &amp; Luxury Apparel</option>
                    <option value="Consumer Tech & Studio Audio">Consumer Tech &amp; Studio Audio</option>
                    <option value="Skincare, Fragrance & Beauty">Skincare, Fragrance &amp; Beauty</option>
                    <option value="Interior Design & Home">Interior Design &amp; Home</option>
                    <option value="Fitness & Performance Gear">Fitness &amp; Performance Gear</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="intake-theme" className="block text-sm font-semibold text-foreground mb-2">
                    Preferred Storefront Style
                  </label>
                  <select
                    id="intake-theme"
                    value={formData.theme}
                    onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                  >
                    <option value="Atelier Luxury (Editorial)">Atelier Luxury (Editorial)</option>
                    <option value="Cyber Hardware (Matte Dark)">Cyber Hardware (Matte Dark)</option>
                    <option value="Nordic Living (Warm Minimal)">Nordic Living (Warm Minimal)</option>
                    <option value="Lumière (Clean Skincare)">Lumière (Clean Skincare)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label className="block text-sm font-semibold text-foreground">
                    Primary Audience Countries / Regions (Select All That Apply)
                  </label>
                  <span className="text-xs text-accent-blue font-medium flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    All countries supported · Add more anytime later
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
                  {COUNTRY_OPTIONS.map((country) => {
                    const isSelected = formData.selectedCountries.includes(country.id)
                    return (
                      <label
                        key={country.id}
                        className={`px-3.5 py-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-foreground/5 border-foreground text-foreground font-semibold'
                            : 'bg-card border-border text-muted-foreground hover:bg-accent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCountry(country.id)}
                          className="accent-foreground"
                        />
                        <span className="text-xs leading-tight">{country.label}</span>
                      </label>
                    )
                  })}
                </div>

                <input
                  type="text"
                  maxLength={150}
                  value={formData.otherCountries}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherCountries: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
                  placeholder="Any other specific countries? (Optional — you can also add more countries anytime after launch)"
                />
              </div>

              {/* New Field: Describe Store Looks & Features */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <label htmlFor="intake-description" className="block text-sm font-semibold text-foreground">
                    Describe the Looks &amp; Features for Your Store
                  </label>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-accent-purple" />
                    Custom colors, vibe, sections, or special features
                  </span>
                </div>
                <textarea
                  id="intake-description"
                  rows={4}
                  maxLength={1500}
                  value={formData.storeDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeDescription: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all resize-none"
                  placeholder="Tell us how you want your storefront to look and work (e.g., dark luxury aesthetic, custom outfit lookbooks, top 10 gear picks, brand story video header, multi-retailer price comparison)..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isAuthBusy}
                className="w-full py-4 rounded-xl bg-foreground text-background font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting
                  ? 'Submitting Registration...'
                  : !account
                  ? 'Sign Up / Sign In & Register Free Prototype'
                  : 'Register Free Prototype'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="text-center mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-blue rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">5 Live Sample Websites</h4>
              <p className="text-muted-foreground text-sm">
                Explore our live sample storefronts above or request your custom prototype below
              </p>
            </div>
            
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-emerald rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">One-Time Setup Fee</h4>
              <p className="text-muted-foreground text-sm">
                $0/month forever and 0% platform cut — You keep 100% of affiliate payouts
              </p>
            </div>
            
            <div className="bg-background clean-border rounded-2xl p-6 subtle-shadow">
              <div className="w-12 h-12 bg-accent-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 bg-accent-purple rounded-full" />
              </div>
              <h4 className="font-black text-foreground mb-2">All Countries Supported</h4>
              <p className="text-muted-foreground text-sm">
                Built-in global geo-routing for every country — plus add new countries anytime later
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up / Sign In Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-background border border-border p-6 sm:p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-black text-foreground">
              {authMode === 'signup' ? 'Create Your Creator Account' : 'Welcome Back — Sign In'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {authMode === 'signup'
                ? 'Sign up once to request your custom storefront prototype. We will remember your credentials for future visits.'
                : 'Sign in with your saved email and password to continue.'}
            </DialogDescription>
          </DialogHeader>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-card border border-border mt-2">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup')
                setAuthError('')
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signup'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              First-Time Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin')
                setAuthError('')
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === 'signin'
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Returning Sign In
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4 mt-2">
            {authMode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-semibold text-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  value={authForm.name}
                  onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                  placeholder="Sarah Jenkins"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-semibold text-foreground mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-semibold text-foreground mb-1.5">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                required
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                value={authForm.password}
                onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent-blue/50"
                placeholder="At least 6 characters"
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={authForm.rememberMe}
                onChange={(e) => setAuthForm(prev => ({ ...prev, rememberMe: e.target.checked }))}
                className="accent-foreground"
              />
              <span>Remember my credentials on this device</span>
            </label>

            {authError && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthBusy}
              className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {isAuthBusy
                ? 'Please wait...'
                : authMode === 'signup'
                ? 'Sign Up & Continue'
                : 'Sign In & Continue'}
            </button>
          </form>

          <div className="relative my-2 flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-xs text-muted-foreground">OR</span>
            <div className="border-t border-border w-full" />
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isAuthBusy}
            className="w-full py-2.5 px-4 rounded-xl bg-card border border-border text-foreground font-semibold text-xs hover:bg-accent transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Continue with Google
          </button>
        </DialogContent>
      </Dialog>

      {/* Confirmation Popup Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-background border border-border p-8 text-center">
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-accent-emerald/15 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-8 h-8 text-accent-emerald" />
            </div>
            <DialogTitle className="text-2xl font-black text-foreground text-center">
              Your Request is Submitted!
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground leading-relaxed text-center pt-1">
              Your request is submitted, our team will contact you once your prototype is ready.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
            >
              Done
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}