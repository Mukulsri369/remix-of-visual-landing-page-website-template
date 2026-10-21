'use client'

export function Portfolio() {
  return (
    <section id="portfolio" className="relative py-32 bg-background">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-accent-emerald rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">
              The Cross-Discovery Funnel
            </span>
            <div className="w-3 h-3 bg-accent-blue rounded-full animate-pulse" />
          </div>
          
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
            <span className="block mb-2">One click from social. Endless cart discovery.</span>
          </h2>
          
          <p className="text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Standard affiliate links send followers to isolated product pages where you lose cross-sells. Your custom storefront turns single-item curiosity into multi-product discovery without managing inventory or checkout.
          </p>
        </div>

        {/* Primary Showcase Card */}
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-card clean-border rounded-3xl overflow-hidden elevated-shadow">
            <div className="p-8 lg:p-12">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-accent-purple/10 text-accent-purple px-3 py-1 rounded-full text-sm font-medium">
                    Zero Merchant Liability
                  </span>
                  <span className="text-sm text-muted-foreground">
                    100% Direct Commission Attribution
                  </span>
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                  Curated showcase, not a checkout middleman.
                </h3>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Every purchase routes directly to external retailers—meaning zero customer support, zero returns, and 100% direct commission attribution. Instead of marketplace clutter, visitors land on a high-contrast editorial showcase with your notes, styling context, and automated complementary pairings.
                </p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block">01. Social Discovery</span>
                    <span className="font-medium">Single Social Tap (@sarah.curates)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">02. Branded Hub</span>
                    <span className="font-medium">Editorial Product Page</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">03. Cross-Discovery</span>
                    <span className="font-medium">Automated Pairing (+3.8x Yield)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">04. Direct Checkout</span>
                    <span className="font-medium">Verified Retailer Handoff</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}