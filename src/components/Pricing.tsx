import { useState } from 'react'
import {
  Check,
  X,
  Database,
  Sparkles,
  ArrowUpRight,
  Headphones,
  CheckCircle2,
} from 'lucide-react'
import {
  PRICING_PLANS,
  PRICING_VALUE_PROPOSITIONS,
  FEATURE_COMPARISON_ROWS,
  DATABASE_FREEDOM_CARDS,
  SUPPORT_PILLARS,
  PlanId,
  OnboardingIntent,
} from '@/lib/pricing'

export function Pricing() {
  const [expandedPlanDetails, setExpandedPlanDetails] = useState<Record<PlanId, boolean>>({
    starter: false,
    creator: false,
    premium: false,
  })

  const triggerOnboardingAction = (intent: OnboardingIntent) => {
    window.dispatchEvent(new CustomEvent('select-onboarding-intent', { detail: intent }))
    const contactEl = document.getElementById('contact')
    contactEl?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="pricing" className="relative py-28 bg-background border-t border-border">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Pricing Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              One-Time Storefront Ownership · Zero Monthly Subscriptions
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>

          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight text-foreground mb-6">
            {PRICING_VALUE_PROPOSITIONS.primary}
          </h2>

          <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed mb-8">
            {PRICING_VALUE_PROPOSITIONS.secondary}
          </p>

          {/* Distinct 7-Day Free Trial & Free Prototype Registration Banner */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 p-2 rounded-2xl bg-card clean-border subtle-shadow">
            <button
              type="button"
              onClick={() => triggerOnboardingAction('free_prototype')}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-colors cursor-pointer"
            >
              Register Free Prototype
            </button>
            <button
              type="button"
              onClick={() => triggerOnboardingAction('free_trial_7d')}
              className="px-6 py-3 rounded-xl bg-foreground text-background hover:opacity-90 font-bold text-sm transition-opacity cursor-pointer"
            >
              Start Your 7-Day Free Trial
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Register for Your Prototype — Absolutely Free</strong> lets you preview a tailored storefront concept.{' '}
            <strong>7-Day Free Trial</strong> lets you experience the live supported platform before choosing a one-time plan.
          </p>
        </div>

        {/* Three Pricing Cards in One Row on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {(['starter', 'creator', 'premium'] as PlanId[]).map((planKey) => {
            const plan = PRICING_PLANS[planKey]
            const isPremium = Boolean(plan.isFlagship)
            const isExpanded = expandedPlanDetails[planKey]

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isPremium
                    ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-2 border-accent-blue shadow-[0_25px_70px_-15px_rgba(37,99,235,0.45)] lg:-translate-y-3 p-8 sm:p-10'
                    : 'bg-card/60 text-foreground clean-border subtle-shadow p-8 sm:p-9'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-black tracking-wider uppercase shadow-md whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan Name & Tagline */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        isPremium
                          ? 'bg-accent-blue/20 text-blue-300 border border-blue-400/30'
                          : 'bg-foreground/10 text-foreground'
                      }`}
                    >
                      {plan.name}
                    </span>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isPremium ? 'text-emerald-300' : 'text-accent-emerald'
                      }`}
                    >
                      24×7 Support Included
                    </span>
                  </div>

                  <p
                    className={`text-sm font-semibold mb-4 ${
                      isPremium ? 'text-blue-200' : 'text-muted-foreground'
                    }`}
                  >
                    “{plan.tagline}”
                  </p>

                  {/* Price & One-Time Label */}
                  <div className="mb-6 pb-6 border-b border-current/10">
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl sm:text-6xl font-black tracking-tight">
                        {plan.formattedPrice}
                      </span>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${
                            isPremium
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-accent-emerald/15 text-accent-emerald'
                          }`}
                        >
                          {plan.paymentLabel}
                        </span>
                        <span
                          className={`text-xs mt-1 ${
                            isPremium ? 'text-slate-300' : 'text-muted-foreground'
                          }`}
                        >
                          No monthly subscription
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Headline & Description */}
                  <h3 className="text-2xl font-black mb-2 leading-snug">{plan.cardHeadline}</h3>
                  <p
                    className={`text-sm leading-relaxed mb-6 ${
                      isPremium ? 'text-slate-300' : 'text-muted-foreground'
                    }`}
                  >
                    {plan.cardDescription}
                  </p>

                  {/* Card Highlights */}
                  <div className="grid grid-cols-1 gap-2 mb-6">
                    {plan.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                          isPremium
                            ? 'bg-white/10 text-white border border-white/10'
                            : 'bg-background clean-border text-foreground'
                        }`}
                      >
                        <Sparkles
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isPremium ? 'text-blue-400' : 'text-accent-blue'
                          }`}
                        />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>

                  {/* Primary Card Bullets */}
                  <ul className="space-y-3 mb-6">
                    {plan.cardBullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            isPremium ? 'text-emerald-400' : 'text-accent-emerald'
                          }`}
                        />
                        <span className={isPremium ? 'text-slate-100' : 'text-foreground'}>
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Expandable Complete Entitlement List */}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPlanDetails((prev) => ({
                        ...prev,
                        [planKey]: !prev[planKey],
                      }))
                    }
                    className={`text-xs font-bold underline underline-offset-4 mb-6 inline-block cursor-pointer ${
                      isPremium ? 'text-blue-300 hover:text-white' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {isExpanded ? 'Hide complete specification ▲' : 'View complete plan specification ▼'}
                  </button>

                  {isExpanded && (
                    <div
                      className={`mb-6 p-4 rounded-2xl text-xs space-y-3 ${
                        isPremium ? 'bg-white/5 border border-white/10' : 'bg-background clean-border'
                      }`}
                    >
                      <div className="font-bold uppercase tracking-wider opacity-80">
                        Included Capabilities:
                      </div>
                      <ul className="space-y-1.5">
                        {plan.includedFeatures.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-accent-emerald shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.exclusions.length > 0 && (
                        <>
                          <div className="font-bold uppercase tracking-wider opacity-80 pt-2 border-t border-current/10">
                            Not Included in {plan.name}:
                          </div>
                          <ul className="space-y-1.5 opacity-75">
                            {plan.exclusions.map((ex) => (
                              <li key={ex} className="flex items-start gap-2">
                                <X className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                                <span>{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => triggerOnboardingAction(plan.id)}
                    className={`w-full py-4 px-6 rounded-xl font-black text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPremium
                        ? 'bg-gradient-to-r from-accent-blue to-accent-purple text-white hover:opacity-95 shadow-lg'
                        : 'bg-foreground text-background hover:opacity-90'
                    }`}
                  >
                    <span>{plan.ctaLabel}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Required 4-Pillar Strip Immediately Below Pricing Cards */}
        <div className="max-w-6xl mx-auto mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_VALUE_PROPOSITIONS.trustBar.map((item) => (
            <div
              key={item}
              className="bg-card clean-border rounded-2xl px-5 py-4 flex items-center justify-center gap-2.5 text-center subtle-shadow"
            >
              <CheckCircle2 className="w-4 h-4 text-accent-emerald shrink-0" />
              <span className="text-sm font-black text-foreground">{item}</span>
            </div>
          ))}
        </div>

        {/* Comprehensive Feature Comparison Table */}
        <div className="max-w-7xl mx-auto mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-black text-foreground mb-3">
              Comprehensive Feature Comparison
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Every capability mapped transparently to backend plan entitlements—with zero artificial product-count limits on any tier.
            </p>
          </div>

          <div className="bg-background clean-border rounded-3xl overflow-hidden elevated-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead>
                  <tr className="border-b border-border bg-card/70">
                    <th className="py-5 px-6 text-sm font-black text-foreground w-2/5">
                      Platform Capability
                    </th>
                    <th className="py-5 px-4 text-center text-sm font-black text-foreground w-1/5">
                      Starter
                      <span className="block text-xs font-bold text-muted-foreground mt-0.5">
                        ₹599 One-Time
                      </span>
                    </th>
                    <th className="py-5 px-4 text-center text-sm font-black text-foreground w-1/5">
                      Creator
                      <span className="block text-xs font-bold text-muted-foreground mt-0.5">
                        ₹1,499 One-Time
                      </span>
                    </th>
                    <th className="py-5 px-4 text-center text-sm font-black text-accent-blue bg-accent-blue/5 w-1/5">
                      Premium
                      <span className="block text-xs font-bold text-accent-blue mt-0.5">
                        ₹3,999 One-Time
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {FEATURE_COMPARISON_ROWS.map((row) => {
                    const renderCell = (val: string | boolean, highlight = false) => {
                      if (typeof val === 'boolean') {
                        return val ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-emerald/15 text-accent-emerald">
                            <Check className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground/50">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )
                      }
                      return (
                        <span
                          className={`text-xs font-bold ${
                            highlight ? 'text-accent-blue' : 'text-foreground'
                          }`}
                        >
                          {val}
                        </span>
                      )
                    }

                    return (
                      <tr key={row.feature} className="hover:bg-card/40 transition-colors">
                        <td className="py-4 px-6 font-medium text-foreground">
                          {row.feature}
                        </td>
                        <td className="py-4 px-4 text-center">{renderCell(row.starter)}</td>
                        <td className="py-4 px-4 text-center">{renderCell(row.creator)}</td>
                        <td className="py-4 px-4 text-center bg-accent-blue/5">
                          {renderCell(row.premium, true)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dedicated Section: Database Setup — All Plans */}
        <div className="max-w-7xl mx-auto mt-28 bg-card/50 clean-border rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent-blue mb-3">
              <Database className="w-4 h-4" />
              Database-Driven Product Capacity · All Plans
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
              Your Products. Your Database. Your Freedom.
            </h3>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              We help you set up an eligible free-tier database, so your store can grow according to the resources you choose.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DATABASE_FREEDOM_CARDS.map((card) => (
              <div
                key={card.number}
                className="bg-background clean-border rounded-2xl p-6 subtle-shadow flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-black text-accent-blue block mb-3">
                    {card.number}
                  </span>
                  <h4 className="text-lg font-black text-foreground mb-2">{card.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground">Architecture &amp; Resource Transparency:</strong>{' '}
              Your store connects to a provisioned Firebase Firestore database with indexed pagination and strict tenant security rules. Standard cloud provider storage, read/write quotas, API rate limits, and hosting limits apply.
            </div>
            <button
              type="button"
              onClick={() => triggerOnboardingAction('free_prototype')}
              className="shrink-0 font-bold text-foreground underline underline-offset-4 cursor-pointer"
            >
              Request Free Database Setup Assistance →
            </button>
          </div>
        </div>

        {/* Dedicated Section: 24×7 Support — All Plans */}
        <div className="max-w-7xl mx-auto mt-20 bg-background clean-border rounded-3xl p-8 sm:p-12 lg:p-16 subtle-shadow">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-accent-emerald mb-3">
              <Headphones className="w-4 h-4" />
              24×7 Support Included Across Starter, Creator &amp; Premium
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
              Your Store Is Yours. You're Never Alone.
            </h3>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Get access to our 24×7 support team for technical issues, store guidance and future upgrade assistance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SUPPORT_PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="bg-card/50 clean-border rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-accent-emerald/15 text-accent-emerald mb-4">
                    {pillar.badge}
                  </span>
                  <h4 className="text-xl font-black text-foreground mb-2">{pillar.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            Premium customers receive priority routing and advanced design consultation. Custom future redesigns or bespoke out-of-scope engineering enhancements are scoped transparently for your approval before any service fee is charged.
          </div>
        </div>
      </div>
    </section>
  )
}
