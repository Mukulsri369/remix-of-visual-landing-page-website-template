import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function Contact() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    handle: '',
    niche: 'fashion',
    theme: 'atelier',
    region: 'both'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.handle.trim()) {
      toast({ title: 'Please fill in your name and social handle', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    setTimeout(() => {
      toast({
        title: 'Application received!',
        description: 'Our design team will reach out within 4 business hours with your custom storefront preview.'
      })
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 800)
  }

  return (
    <section id="contact" className="relative py-32 bg-card/30">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              Fast-Track Onboarding
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">DM “STORE” on Instagram to get started.</span>
          </h2>
          
          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Want a custom preview for your creator brand? Message our design desk with your social handle and we will prepare a live storefront concept within 4 hours.
          </p>
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
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                    onChange={(e) => {
                      setIsSubmitted(false)
                      setFormData(prev => ({ ...prev, name: e.target.value }))
                    }}
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
                    onChange={(e) => {
                      setIsSubmitted(false)
                      setFormData(prev => ({ ...prev, handle: e.target.value }))
                    }}
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
                    <option value="fashion">Fashion &amp; Luxury Apparel</option>
                    <option value="tech">Consumer Tech &amp; Studio Audio</option>
                    <option value="beauty">Skincare, Fragrance &amp; Beauty</option>
                    <option value="home">Interior Design &amp; Home</option>
                    <option value="fitness">Fitness &amp; Performance Gear</option>
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
                    <option value="atelier">Atelier Luxury (Editorial)</option>
                    <option value="cyber">Cyber Hardware (Matte Dark)</option>
                    <option value="nordic">Nordic Living (Warm Minimal)</option>
                    <option value="lumiere">Lumière (Clean Skincare)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Primary Audience Region
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="px-4 py-3 rounded-xl bg-card border border-border flex items-center gap-2.5 cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="geo-focus"
                      value="both"
                      checked={formData.region === 'both'}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium text-foreground">India + USA</span>
                  </label>
                  <label className="px-4 py-3 rounded-xl bg-card border border-border flex items-center gap-2.5 cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="geo-focus"
                      value="us"
                      checked={formData.region === 'us'}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium text-foreground">USA Only</span>
                  </label>
                  <label className="px-4 py-3 rounded-xl bg-card border border-border flex items-center gap-2.5 cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="geo-focus"
                      value="in"
                      checked={formData.region === 'in'}
                      onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                      className="accent-foreground"
                    />
                    <span className="text-sm font-medium text-foreground">India Only</span>
                  </label>
                </div>
              </div>

              {isSubmitted && (
                <div className="p-4 rounded-xl bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald text-sm font-medium text-center">
                  ✓ Application received! Our design team will reach out within 4 business hours with your custom storefront preview.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-foreground text-background font-black text-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting Application...' : 'Request Storefront Prototype'}
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
              <h4 className="font-black text-foreground mb-2">Message ‘STORE’ on Instagram</h4>
              <p className="text-muted-foreground text-sm">
                Avg. reply: &lt; 20 mins · Live storefront concept prepared within 4 hours
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
              <h4 className="font-black text-foreground mb-2">India (₹) &amp; USA ($) Routing</h4>
              <p className="text-muted-foreground text-sm">
                Built-in cross-border geo-routing with unlimited products &amp; automated link imports
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}