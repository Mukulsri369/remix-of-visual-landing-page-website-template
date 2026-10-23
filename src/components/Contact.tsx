import { useState, useEffect } from 'react'
import { SampleGallery } from './SampleGallery'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ArrowRight, ArrowLeft, ArrowUpRight, Check, CheckCircle2, Eye, EyeOff, Loader2, LogOut } from 'lucide-react'
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
  starter: 'Starter Plan — ₹3,999 (One-Time Payment)',
  creator: 'Creator Plan — ₹4,999 (One-Time Payment)',
  premium: 'Premium Plan — ₹5,999 (One-Time Payment · Best for Growing Brands)',
}

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

export function Contact({ initialIntent = 'free_prototype' }: { initialIntent?: OnboardingIntent }) {
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
  const [briefStep, setBriefStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [profileError, setProfileError] = useState('')
  const openAuth = (mode: 'signup' | 'signin') => {
    setAuthMode(mode)
    setAuthError('')
    setShowPassword(false)
    setPendingSubmitAfterAuth(false)
    setShowAuthModal(true)
  }
  const switchAuth = () => {
    setAuthMode(previous => previous === 'signup' ? 'signin' : 'signup')
    setAuthError('')
    setShowPassword(false)
  }


  const [formData, setFormData] = useState({
    onboardingIntent: initialIntent,
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

  useEffect(() => {
    setFormData(previous => ({ ...previous, onboardingIntent: initialIntent }))
  }, [initialIntent])

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
    let delivered = false

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
          delivered = true
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
        const response = await fetch('https://formsubmit.co/ajax/mukul.srivastava.025@gmail.com', {
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
        if (!response.ok) throw new Error('Delivery unavailable')
        const receipt = await response.json()
        if (receipt.success !== true && receipt.success !== 'true') throw new Error('Delivery was not confirmed')
        delivered = true
      } catch (emailErr) {
        console.warn('Email webhook warning:', emailErr)
      }

      // Confirm receipt before telling the visitor that the brief was sent.
      if (!delivered) throw new Error('Delivery was not confirmed')
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
      setAuthForm(previous => ({ ...previous, password: '' }))

      if (pendingSubmitAfterAuth) {
        setPendingSubmitAfterAuth(false)
        await executePrototypeSubmission(session)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please try again.'
      setAuthError(msg.includes('Firebase:') ? 'We could not sign you in. Check your email and password, then try again.' : msg)
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
      setAuthForm(previous => ({ ...previous, password: '' }))
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
      setAuthError('')
      setShowPassword(false)
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

  const goBriefStep = (step: number) => {
    setBriefStep(step)
    requestAnimationFrame(() => {
      const panel = document.getElementById('brief-form-panel')
      if (panel) window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - 110, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      document.getElementById('brief-step-title')?.focus({ preventScroll: true })
    })
  }
  const themes = [
    { name: 'Atelier Luxury (Editorial)', title: 'Atelier', description: 'Warm, editorial', color: 'atelier' },
    { name: 'Cyber Hardware (Matte Dark)', title: 'Obsidian', description: 'Dark, precise', color: 'obsidian' },
    { name: 'Nordic Living (Warm Minimal)', title: 'Nordic', description: 'Soft, natural', color: 'nordic' },
    { name: 'Lumière (Clean Skincare)', title: 'Lumière', description: 'Light, refined', color: 'lumiere' },
  ]
  const intentNames: Record<OnboardingIntent, string> = {
    free_prototype: 'Free prototype', free_trial_7d: '7-day trial',
    starter: 'Starter · ₹3,999', creator: 'Creator · ₹4,999', premium: 'Premium · ₹5,999',
  }
  const advanceBrief = (event: React.FormEvent) => {
    if (briefStep === 0) {
      event.preventDefault()
      if (!formData.name.trim() || !formData.handle.trim()) {
        setProfileError('Add your name and social profile to continue.')
        document.getElementById(!formData.name.trim() ? 'intake-name' : 'intake-handle')?.focus()
        return
      }
      setProfileError('')
      goBriefStep(1)
    } else {
      void handleFormSubmit(event)
    }
  }

  return (
    <section className="atelier-contact" aria-label="Storefront enquiry">
      <SampleGallery />
      <div className="brief-layout" id="contact">
        <aside className="brief-intro">
          <h2>Make it<br />unmistakably yours.</h2>
          <p>Tell us about your world. We’ll help turn your recommendations into a storefront with a point of view.</p>
          <figure><img src="/films/watch-detail.jpg" alt="Close-up of the watch from the product film" loading="lazy" /><figcaption>Considered down to the detail.</figcaption></figure>
          <div className="brief-reassurance"><span>A free prototype to begin.</span><span>One-time ownership when you’re ready.</span></div>
        </aside>
        <div className="brief-panel" id="brief-form-panel">
          <nav className="brief-progress" aria-label="Storefront brief progress">
            <button type="button" aria-current={briefStep === 0 ? 'step' : undefined} onClick={() => goBriefStep(0)}>{briefStep > 0 && <Check size={15} aria-hidden="true" />}Your profile</button>
            <span aria-hidden="true">/</span>
            <span aria-current={briefStep === 1 ? 'step' : undefined}>Your vision</span>
          </nav>
          <form className="brief-form" onSubmit={advanceBrief}>
            <div className="brief-step-heading" aria-live="polite"><h3 id="brief-step-title" tabIndex={-1}>{briefStep === 0 ? 'A little about you.' : 'Set the direction.'}</h3><p>{briefStep === 0 ? 'Start with the person behind the collection.' : 'Choose a starting style. We’ll tailor the details together.'}</p></div>
            {briefStep === 0 ? <div className="brief-fields" key="profile">
              <div className="field-pair"><div className="atelier-field"><label htmlFor="intake-name">Your name</label><input id="intake-name" type="text" autoComplete="name" required maxLength={100} placeholder="Full name" value={formData.name} onChange={event => setFormData(previous => ({ ...previous, name: event.target.value }))} /></div><div className="atelier-field"><label htmlFor="intake-handle">Social profile</label><input id="intake-handle" type="text" autoCapitalize="none" spellCheck={false} required maxLength={255} placeholder="@yourname or profile URL" value={formData.handle} onChange={event => setFormData(previous => ({ ...previous, handle: event.target.value }))} /></div></div>
              {profileError && <p className="atelier-error" role="alert">{profileError}</p>}
              <div className="atelier-field"><label htmlFor="intake-niche">What do you curate?</label><select id="intake-niche" value={formData.niche} onChange={event => setFormData(previous => ({ ...previous, niche: event.target.value }))}>{['Fashion & Luxury Apparel', 'Consumer Tech & Studio Audio', 'Skincare, Fragrance & Beauty', 'Interior Design & Home', 'Fitness & Performance Gear'].map(niche => <option key={niche}>{niche}</option>)}</select></div>
              <div className="atelier-field"><label htmlFor="intake-intent">Where would you like to start?</label><select id="intake-intent" value={formData.onboardingIntent} onChange={event => setFormData(previous => ({ ...previous, onboardingIntent: event.target.value as OnboardingIntent }))}>{Object.entries(intentNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select><span className="field-help">Paid plans are a one-time payment.</span></div>
            </div> : <div className="brief-fields" key="vision">
              <fieldset className="theme-fieldset"><legend>Choose your starting style</legend><div className="theme-options">{themes.map(theme => <label key={theme.name} className={`theme-option ${formData.theme === theme.name ? 'is-selected' : ''}`}><input type="radio" name="storefront-theme" value={theme.name} checked={formData.theme === theme.name} onChange={() => setFormData(previous => ({ ...previous, theme: theme.name }))} /><span className={`theme-swatch theme-${theme.color}`} aria-hidden="true"><span>M</span></span><span className="theme-name">{theme.title}{formData.theme === theme.name && <Check size={14} aria-hidden="true" />}</span><span className="theme-description">{theme.description}</span></label>)}</div></fieldset>
              <div className="atelier-field"><label htmlFor="intake-description">Tell us what you have in mind <span>Optional</span></label><textarea id="intake-description" rows={4} maxLength={1500} placeholder="The mood, the products, the details that make it yours…" value={formData.storeDescription} onChange={event => setFormData(previous => ({ ...previous, storeDescription: event.target.value }))} /><span className="field-help field-count">{formData.storeDescription.length} / 1,500</span></div>
              <details className="audience-disclosure"><summary>Where is your audience?<span>{formData.selectedCountries.length === 1 && formData.selectedCountries[0] === 'Global (All Countries)' ? 'Worldwide' : `${formData.selectedCountries.length} selected`} <span aria-hidden="true">+</span></span></summary><fieldset><legend className="sr-only">Audience countries</legend><div className="country-options">{COUNTRY_OPTIONS.map(country => <label key={country.id}><input type="checkbox" checked={formData.selectedCountries.includes(country.id)} onChange={() => toggleCountry(country.id)} /><span>{country.label}</span></label>)}</div></fieldset><div className="atelier-field"><label htmlFor="intake-other-countries">Other countries <span>Optional</span></label><input id="intake-other-countries" maxLength={150} placeholder="Add any specific regions" value={formData.otherCountries} onChange={event => setFormData(previous => ({ ...previous, otherCountries: event.target.value }))} /></div></details>
              <div className="brief-summary"><span>{intentNames[formData.onboardingIntent]}</span><button type="button" onClick={() => goBriefStep(0)}>Edit your profile</button></div>
            </div>}
            <div className="brief-actions">
              {briefStep === 1 && <button className="brief-back" type="button" onClick={() => goBriefStep(0)}><ArrowLeft size={16} aria-hidden="true" />Back</button>}
              <button className="atelier-primary" type="submit" disabled={isSubmitting || isAuthBusy}>{isSubmitting ? <><Loader2 className="spin" size={18} aria-hidden="true" />Sending your brief</> : <>{briefStep === 0 ? 'Continue to your vision' : account ? 'Send your brief' : 'Continue with your account'}<ArrowRight size={18} aria-hidden="true" /></>}</button>
            </div>
            <p className="brief-footnote">{briefStep === 0 ? 'Your details stay here as you explore the next step.' : account ? 'Review your direction, then send it to the team.' : 'Sign in or create an account to send your brief.'}</p>
          </form>
          <div className="brief-account">{account ? <><span>Signed in as <strong>{account.name}</strong></span><button type="button" onClick={handleSignOut}><LogOut size={14} aria-hidden="true" />Sign out</button></> : <><span>Already have an account?</span><button type="button" onClick={() => openAuth('signin')}>Sign in <ArrowUpRight size={15} aria-hidden="true" /></button></>}</div>
        </div>
      </div>
      <Dialog open={showAuthModal} onOpenChange={open => { setShowAuthModal(open); if (!open) { setPendingSubmitAfterAuth(false); setAuthForm(previous => ({ ...previous, password: '' })) } }}>
        <DialogContent overlayClassName="atelier-overlay" className="atelier-auth" onOpenAutoFocus={event => { event.preventDefault(); document.getElementById(authMode === 'signup' ? 'auth-name' : 'auth-email')?.focus() }}>
          <span className="auth-wordmark" aria-hidden="true">monolith®</span>
          <DialogHeader className="atelier-auth-heading"><DialogTitle>{authMode === 'signup' ? 'A space of your own.' : 'Welcome back.'}</DialogTitle><DialogDescription>{pendingSubmitAfterAuth ? 'Your brief is ready. Continue with your account to send it.' : authMode === 'signup' ? 'Create your account to begin your storefront.' : 'Sign in to continue your storefront journey.'}</DialogDescription></DialogHeader>
          <button className="atelier-google" type="button" onClick={handleGoogleAuth} disabled={isAuthBusy}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.2h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.5ZM12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.9-1.8-5.7-4.1H2.9v2.6A10 10 0 0 0 12 22ZM6.3 13.9a6 6 0 0 1 0-3.8V7.5H2.9a10 10 0 0 0 0 9l3.4-2.6ZM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.6 9.6 0 0 0 12 2a10 10 0 0 0-9.1 5.5l3.4 2.6C7.1 7.8 9.4 6 12 6Z" /></svg>Continue with Google</button>
          <p className="auth-separator">or use your email</p>
          <form className="atelier-auth-form" onSubmit={handleAuthSubmit}>
            {authMode === 'signup' && <div className="atelier-field"><label htmlFor="auth-name">Your name</label><input id="auth-name" autoComplete="name" required maxLength={100} value={authForm.name} onChange={event => setAuthForm(previous => ({ ...previous, name: event.target.value }))} placeholder="Full name" disabled={isAuthBusy} /></div>}
            <div className="atelier-field"><label htmlFor="auth-email">Email address</label><input id="auth-email" type="email" autoComplete="email" autoCapitalize="none" required disabled={isAuthBusy} value={authForm.email} onChange={event => { setAuthError(''); setAuthForm(previous => ({ ...previous, email: event.target.value })) }} placeholder="you@example.com" /></div>
            <div className="atelier-field"><label htmlFor="auth-password">Password</label><div className="password-field"><input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'} minLength={6} required disabled={isAuthBusy} aria-describedby={authMode === 'signup' ? 'password-help' : undefined} value={authForm.password} onChange={event => { setAuthError(''); setAuthForm(previous => ({ ...previous, password: event.target.value })) }} placeholder={authMode === 'signup' ? 'Create a password' : 'Your password'} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button></div>{authMode === 'signup' && <span className="field-help" id="password-help">Use at least 6 characters.</span>}</div>
            {authError && <p className="atelier-error" role="alert">{authError}</p>}
            <button className="atelier-primary" type="submit" disabled={isAuthBusy}>{isAuthBusy ? <><Loader2 className="spin" size={18} aria-hidden="true" />Connecting</> : <>{authMode === 'signup' ? 'Create account' : 'Sign in'}<ArrowRight size={18} aria-hidden="true" /></>}</button>
          </form>
          <p className="auth-switch">{authMode === 'signup' ? 'Already have an account?' : 'New to Monolith?'}<button type="button" onClick={switchAuth} disabled={isAuthBusy}>{authMode === 'signup' ? 'Sign in' : 'Create an account'}</button></p>
        </DialogContent>
      </Dialog>
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}><DialogContent overlayClassName="atelier-overlay" className="atelier-auth atelier-success"><CheckCircle2 size={32} aria-hidden="true" /><DialogHeader className="atelier-auth-heading"><DialogTitle>Your brief is with us.</DialogTitle><DialogDescription>We’ll contact you about your storefront prototype.</DialogDescription></DialogHeader><button className="atelier-primary" onClick={() => setShowSuccessModal(false)}>Back to exploring<ArrowRight size={18} aria-hidden="true" /></button></DialogContent></Dialog>
    </section>
  )
}
