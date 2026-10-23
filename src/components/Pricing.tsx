import { useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { PRICING_PLANS, PlanId, OnboardingIntent } from '@/lib/pricing'
export function Pricing() {
  const [selected, setSelected] = useState<PlanId>('creator')
  const [details, setDetails] = useState(false)
  const plan = PRICING_PLANS[selected]
  const choose = (intent: OnboardingIntent) => {
    window.dispatchEvent(new CustomEvent('select-onboarding-intent', { detail: intent }))
    document.getElementById('contact')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section id="pricing" className="ownership-section page-section">
    <div className="ownership-copy"><h2>Pay once.<br />Make it yours.</h2><p>One-time storefront ownership. No monthly platform subscription and no platform commission cut.</p><p className="ownership-note">Database capacity and retailer availability depend on your setup. All plans include database setup assistance and support.</p><button className="text-link" onClick={() => choose('free_prototype')}>Try a free prototype <ArrowUpRight size={18} aria-hidden="true" /></button></div>
    <div className="plan-panel">
      <div className="plan-tabs" role="group" aria-label="Compare ownership plans">{(Object.keys(PRICING_PLANS) as PlanId[]).map(id => <button key={id} aria-pressed={selected === id} onClick={() => { setSelected(id); setDetails(false) }}>{PRICING_PLANS[id].name}</button>)}</div>
      <div className="plan-content"><h3>{plan.name}</h3><p>{plan.cardDescription}</p><p className="plan-price">{plan.formattedPrice}<span>One-time payment</span></p><ul>{plan.cardBullets.map(item => <li key={item}>{item}</li>)}</ul><button className="primary-action" onClick={() => choose(selected)}>{plan.ctaLabel}<ArrowUpRight size={18} aria-hidden="true" /></button><button className="plan-detail-button" aria-expanded={details} aria-controls="plan-details" onClick={() => setDetails(!details)}>{details ? 'Hide full plan details −' : 'See full plan details +'}</button><div id="plan-details" hidden={!details}><h4>Included</h4><ul>{plan.includedFeatures.map(item => <li key={item}>{item}</li>)}</ul>{plan.exclusions.length > 0 && <><h4>Not included</h4><ul>{plan.exclusions.map(item => <li key={item}>{item}</li>)}</ul></>}</div></div>
    </div>
  </section>
}
