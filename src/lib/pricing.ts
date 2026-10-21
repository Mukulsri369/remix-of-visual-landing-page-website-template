export type PlanId = 'starter' | 'creator' | 'premium'
export type OnboardingIntent =
  | 'free_prototype'
  | 'free_trial_7d'
  | 'starter'
  | 'creator'
  | 'premium'

export interface PlanEntitlements {
  planId: PlanId
  artificialProductCap: null // Never restricted by plan; determined by database resources
  autoImportAffiliateLinks: boolean
  freeDatabaseSetupAssistance: boolean
  adminDashboard: boolean
  exactDuplicatePrevention: boolean
  smartDuplicateSuggestions: boolean
  smartCatalogRecommendations: boolean
  advancedVisualCustomization: boolean
  oneClickBulkPriceRefresh: boolean
  oneClickBulkStockRefresh: boolean
  autoOutOfStockDeactivation: boolean
  multiCountryIndiaUsStorefronts: boolean
  support24x7: boolean
  priorityDesignAssistance: boolean
}

export interface PricingPlanConfig {
  id: PlanId
  name: string
  priceInr: number
  formattedPrice: string
  paymentLabel: string
  tagline: string
  cardHeadline: string
  cardDescription: string
  badge?: string
  highlights: string[]
  cardBullets: string[]
  includedFeatures: string[]
  exclusions: string[]
  ctaLabel: string
  isFlagship?: boolean
  entitlements: PlanEntitlements
}

export const PRICING_VALUE_PROPOSITIONS = {
  primary: 'Pay Once. Own Your Affiliate Store.',
  secondary:
    'From your first product to thousands, your database determines capacity—not your pricing plan.',
  trustBar: [
    'No Monthly Platform Subscription',
    'No Artificial Plan-Based Product Limits',
    'Free Database Setup Assistance',
    '24×7 Support',
  ],
}

export const PRICING_PLANS: Record<PlanId, PricingPlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceInr: 3999,
    formattedPrice: '₹3,999',
    paymentLabel: 'ONE-TIME PAYMENT',
    tagline: 'Your First Affiliate Store, Made Simple.',
    cardHeadline: 'Launch Your First Affiliate Store',
    cardDescription:
      'Start recommending products through your own branded storefront with instant affiliate link fetching, country-specific storefronts, and essential controls.',
    highlights: [
      'Auto-Fetch Affiliate Link Details & Images',
      'Country-Specific Storefronts',
      'Products Limited by Database, Not Plan',
      '24×7 Support',
    ],
    cardBullets: [
      'Auto-fetch product details & images from any affiliate link — ready to publish',
      'Add country-specific regional storefronts',
      'Database-based product capacity (no plan cap)',
      'Free database setup assistance',
      'Product admin dashboard & responsive design',
      '24×7 support included',
    ],
    includedFeatures: [
      'One branded affiliate storefront',
      'Paste any affiliate link to auto-fetch product details, pricing & high-res images — ready to publish',
      'Country-Specific Storefronts (add & configure dedicated regional storefronts by country)',
      'No artificial plan-based product-count cap',
      'Product capacity determined by configured database resources',
      'Assistance setting up a compatible free-tier database',
      'Product category selection',
      'Product publishing and unpublishing',
      'Add, edit and delete products',
      'Standard administrative dashboard',
      'Storefront heading and text editing',
      'Basic product category management',
      'Exact duplicate-entry prevention',
      'Starter storefront design options',
      'Mobile-responsive storefront',
      'Manual price and stock management',
      '24×7 support access',
      'Assistance with future plan upgrades',
    ],
    exclusions: [
      'Intelligent suggestions for similar or duplicate products',
      'Smart catalog recommendations',
      'Advanced visual layout customization',
      'One-click bulk price refresh',
      'One-click bulk stock availability refresh',
      'Automatic out-of-stock deactivation from bulk refresh results',
    ],
    ctaLabel: 'Get Starter',
    entitlements: {
      planId: 'starter',
      artificialProductCap: null,
      autoImportAffiliateLinks: true,
      freeDatabaseSetupAssistance: true,
      adminDashboard: true,
      exactDuplicatePrevention: true,
      smartDuplicateSuggestions: false,
      smartCatalogRecommendations: false,
      advancedVisualCustomization: false,
      oneClickBulkPriceRefresh: false,
      oneClickBulkStockRefresh: false,
      autoOutOfStockDeactivation: false,
      multiCountryIndiaUsStorefronts: true,
      support24x7: true,
      priorityDesignAssistance: false,
    },
  },
  creator: {
    id: 'creator',
    name: 'Creator',
    priceInr: 4999,
    formattedPrice: '₹4,999',
    paymentLabel: 'ONE-TIME PAYMENT',
    tagline: 'Turn Your Influence Into a Brand.',
    cardHeadline: 'Build a Brand Around Your Recommendations',
    cardDescription:
      'Take your storefront further with intelligent duplicate suggestions, smarter catalogs, country-specific storefronts, and advanced visual customization.',
    highlights: [
      'Smart Duplicate Detection',
      'Intelligent Catalog Suggestions',
      'Country-Specific Storefronts',
      'Advanced Store Designs',
      '24×7 Support',
    ],
    cardBullets: [
      'Everything in Starter',
      'Auto-fetch product details & images from any affiliate link — ready to publish',
      'Add country-specific regional storefronts',
      'Smart duplicate & catalog recommendations',
      'Enhanced themes, typography & visual layout controls',
      '24×7 support included',
    ],
    includedFeatures: [
      'Everything in Starter, plus:',
      'Paste any affiliate link to auto-fetch product details, pricing & high-res images — ready to publish',
      'Country-Specific Storefronts (add & configure dedicated regional storefronts by country)',
      'No artificial plan-based product-count cap (database-determined capacity)',
      'Intelligent detection of possible duplicate products',
      'Existing matching-product suggestions',
      'Smart catalog and collection recommendations',
      'Intelligent product grouping suggestions',
      'More premium storefront design templates',
      'Advanced theme, color and typography customization',
      'Supported section layout changes & basic drag-and-drop editing',
      'Category and product card styling',
      'Desktop and mobile storefront previews',
      'More customization options for banners, collections and sections',
      'Standard design consultation',
      '24×7 technical support & assistance with future upgrades',
    ],
    exclusions: [
      'One-click bulk price refresh (Exclusive to Premium)',
      'One-click bulk stock availability refresh (Exclusive to Premium)',
      'Automatic out-of-stock deactivation from bulk refresh (Exclusive to Premium)',
    ],
    ctaLabel: 'Get Creator',
    entitlements: {
      planId: 'creator',
      artificialProductCap: null,
      autoImportAffiliateLinks: true,
      freeDatabaseSetupAssistance: true,
      adminDashboard: true,
      exactDuplicatePrevention: true,
      smartDuplicateSuggestions: true,
      smartCatalogRecommendations: true,
      advancedVisualCustomization: true,
      oneClickBulkPriceRefresh: false,
      oneClickBulkStockRefresh: false,
      autoOutOfStockDeactivation: false,
      multiCountryIndiaUsStorefronts: true,
      support24x7: true,
      priorityDesignAssistance: false,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    priceInr: 5999,
    formattedPrice: '₹5,999',
    paymentLabel: 'ONE-TIME PAYMENT',
    tagline: 'Your Complete Affiliate Business Studio.',
    cardHeadline: 'Your Store. Fully Powered.',
    cardDescription:
      'Run a more advanced affiliate storefront with one-click price and stock updates, premium customization, country-specific storefronts, and priority design assistance.',
    badge: 'BEST FOR GROWING BRANDS',
    isFlagship: true,
    highlights: [
      'One-Click Price & Stock Refresh',
      'Automatic Out-of-Stock Management',
      'Complete Visual Customization',
      'Country-Specific Storefronts',
      '24×7 Support + Priority Assistance',
    ],
    cardBullets: [
      'Everything in Creator',
      'Auto-fetch product details & images from any affiliate link — ready to publish',
      'One-click price and stock refresh',
      'Automatic out-of-stock deactivation',
      'Advanced visual storefront editor',
      'Add country-specific regional storefronts',
      '24×7 support + priority design assistance',
    ],
    includedFeatures: [
      'Everything in Starter and Creator, plus:',
      'Paste any affiliate link to auto-fetch product details, pricing & high-res images — ready to publish',
      'One-Click Price Refresh across supported catalog items',
      'One-Click Stock Availability Refresh with progress & retry controls',
      'Automatic Out-of-Stock Deactivation (only on confirmed unavailable status)',
      'Advanced Visual Storefront Editor (drag-and-drop sections, grids, cards, drafts & rollback)',
      'Country-Specific Storefronts (add & configure dedicated regional storefronts by country)',
      'Professional Design Assistance with priority support routing',
    ],
    exclusions: [],
    ctaLabel: 'Get Premium',
    entitlements: {
      planId: 'premium',
      artificialProductCap: null,
      autoImportAffiliateLinks: true,
      freeDatabaseSetupAssistance: true,
      adminDashboard: true,
      exactDuplicatePrevention: true,
      smartDuplicateSuggestions: true,
      smartCatalogRecommendations: true,
      advancedVisualCustomization: true,
      oneClickBulkPriceRefresh: true,
      oneClickBulkStockRefresh: true,
      autoOutOfStockDeactivation: true,
      multiCountryIndiaUsStorefronts: true,
      support24x7: true,
      priorityDesignAssistance: true,
    },
  },
}

export interface ComparisonFeatureRow {
  feature: string
  category: 'Core & Database' | 'Catalog & Design' | 'Automation & Scale' | 'Support & Ownership'
  starter: string | boolean
  creator: string | boolean
  premium: string | boolean
}

export const FEATURE_COMPARISON_ROWS: ComparisonFeatureRow[] = [
  {
    feature: 'One-time payment',
    category: 'Core & Database',
    starter: '₹3,999 (One-time)',
    creator: '₹4,999 (One-time)',
    premium: '₹5,999 (One-time)',
  },
  {
    feature: 'Free-tier database setup assistance',
    category: 'Core & Database',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Database-dependent product capacity (No plan cap)',
    category: 'Core & Database',
    starter: 'Determined by DB resources',
    creator: 'Determined by DB resources',
    premium: 'Determined by DB resources',
  },
  {
    feature: 'Paste affiliate link to auto-fetch product details & images (ready to publish)',
    category: 'Core & Database',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Product management (add, edit, delete, publish)',
    category: 'Core & Database',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Category management',
    category: 'Core & Database',
    starter: 'Basic',
    creator: 'Advanced + Styling',
    premium: 'Complete Grid & Layout Control',
  },
  {
    feature: 'Storefront text editing',
    category: 'Core & Database',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Basic duplicate prevention (exact match)',
    category: 'Catalog & Design',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Smart duplicate suggestions',
    category: 'Catalog & Design',
    starter: false,
    creator: true,
    premium: true,
  },
  {
    feature: 'Smart catalog recommendations',
    category: 'Catalog & Design',
    starter: false,
    creator: true,
    premium: true,
  },
  {
    feature: 'Design templates',
    category: 'Catalog & Design',
    starter: 'Starter Templates',
    creator: 'Premium Templates',
    premium: 'All Flagship + Custom Themes',
  },
  {
    feature: 'Visual drag-and-drop editing',
    category: 'Catalog & Design',
    starter: false,
    creator: 'Basic Section Editing',
    premium: 'Complete Visual Storefront Editor',
  },
  {
    feature: 'Product and category grid customization',
    category: 'Catalog & Design',
    starter: false,
    creator: 'Card & Category Styling',
    premium: 'Full Dimensions, Shapes & Spacing',
  },
  {
    feature: 'Manual product price/stock edits',
    category: 'Automation & Scale',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'One-click bulk price refresh',
    category: 'Automation & Scale',
    starter: false,
    creator: false,
    premium: true,
  },
  {
    feature: 'One-click bulk availability refresh',
    category: 'Automation & Scale',
    starter: false,
    creator: false,
    premium: true,
  },
  {
    feature: 'Automatic out-of-stock deactivation',
    category: 'Automation & Scale',
    starter: false,
    creator: false,
    premium: true,
  },
  {
    feature: 'Add country-specific regional storefronts',
    category: 'Automation & Scale',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: '24×7 support',
    category: 'Support & Ownership',
    starter: '24×7 Support Included',
    creator: '24×7 Support Included',
    premium: '24×7 Support + Priority Handling',
  },
  {
    feature: 'Future upgrade assistance',
    category: 'Support & Ownership',
    starter: true,
    creator: true,
    premium: true,
  },
  {
    feature: 'Professional redesign consultation',
    category: 'Support & Ownership',
    starter: 'Scoped Quote Available',
    creator: 'Standard Consultation',
    premium: 'Priority Design Assistance',
  },
]

export const DATABASE_FREEDOM_CARDS = [
  {
    number: '01',
    title: 'Free Database Setup Assistance',
    description:
      'Our team helps you configure a compatible, eligible free-tier database (such as Firebase Firestore Spark tier) so you can launch without upfront infrastructure complexity.',
  },
  {
    number: '02',
    title: 'No Artificial Product Limits',
    description:
      'We never restrict your catalog size based on whether you chose Starter (₹3,999), Creator (₹4,999), or Premium (₹5,999). A Starter store with sufficient database capacity can manage thousands of products.',
  },
  {
    number: '03',
    title: 'Scale When You Need To',
    description:
      'Your catalog capacity is governed only by your database provider’s storage, read/write quotas, and hosting resources—upgrade your infrastructure tier only if your traffic demands it.',
  },
  {
    number: '04',
    title: 'Your Data, Properly Configured',
    description:
      'Clear documentation on Firestore collection schemas, indexed pagination, security rules, and exportable product records ensures your catalog remains fast, isolated, and portable.',
  },
]

export const SUPPORT_PILLARS = [
  {
    title: 'Technical Support',
    badge: '24×7 Support Included',
    description:
      'Help with supported store functionality, affiliate link ingestion, database connectivity, errors, and troubleshooting across all plans.',
  },
  {
    title: 'Design Support',
    badge: '24×7 Support Included',
    description:
      'Assistance with supported visual changes, theme settings, typography adjustments, and storefront customization questions.',
  },
  {
    title: 'Future Upgrades',
    badge: 'Seamless Plan Migration',
    description:
      'Guidance on upgrading from Starter to Creator or Premium while preserving 100% of your products, categories, database connections, and affiliate links.',
  },
]

export type AvailabilityStatus =
  | 'in_stock'
  | 'confirmed_out_of_stock'
  | 'unknown'
  | 'source_temporarily_unavailable'
  | 'failed_to_refresh'

export interface CatalogSampleItem {
  id: string
  title: string
  retailer: string
  country: 'IN' | 'US'
  currency: '₹' | '$'
  currentPrice: number
  refreshedPrice: number
  availabilityStatus: AvailabilityStatus
  isPublished: boolean
  lastCheckedAt?: string
}

export interface BulkRefreshResultSummary {
  mode: 'prices' | 'availability' | 'both'
  eligibleCount: number
  updatedCount: number
  failedCount: number
  confirmedUnavailableCount: number
  autoDeactivatedCount: number
  unknownOrUnreachableSkippedCount: number
  completedAt: string
  items: CatalogSampleItem[]
}

/**
 * Trusted entitlement guard for Premium bulk price/stock refresh operations.
 * Rejects non-Premium plans before any refresh job can execute.
 */
export function verifyPremiumRefreshEntitlement(planId: PlanId, isAdminOverride = false): {
  allowed: boolean
  reason?: string
} {
  const plan = PRICING_PLANS[planId]
  if (isAdminOverride || (plan && plan.entitlements.oneClickBulkPriceRefresh && plan.entitlements.oneClickBulkStockRefresh)) {
    return { allowed: true }
  }
  return {
    allowed: false,
    reason: `Permission denied: One-click bulk price and stock refresh requires the Premium plan (current plan: ${plan?.name ?? planId}).`,
  }
}

/**
 * Executes a safe, batched catalog refresh for Premium accounts.
 * Strictly adheres to the rule: ONLY deactivate listings when status is 'confirmed_out_of_stock'.
 * Never deactivates items whose source is 'unknown', 'source_temporarily_unavailable', or 'failed_to_refresh'.
 */
export function runEntitledCatalogRefresh(
  planId: PlanId,
  catalog: CatalogSampleItem[],
  mode: 'prices' | 'availability' | 'both'
): BulkRefreshResultSummary {
  const check = verifyPremiumRefreshEntitlement(planId)
  if (!check.allowed) {
    throw new Error(check.reason)
  }

  const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  let updatedCount = 0
  let failedCount = 0
  let confirmedUnavailableCount = 0
  let autoDeactivatedCount = 0
  let unknownOrUnreachableSkippedCount = 0

  const updatedItems = catalog.map((item) => {
    if (
      item.availabilityStatus === 'source_temporarily_unavailable' ||
      item.availabilityStatus === 'failed_to_refresh'
    ) {
      failedCount += 1
      unknownOrUnreachableSkippedCount += 1
      return {
        ...item,
        lastCheckedAt: nowIso,
        // Never deactivate on failed or unreachable source
        isPublished: item.isPublished,
      }
    }

    if (item.availabilityStatus === 'unknown') {
      unknownOrUnreachableSkippedCount += 1
      updatedCount += mode === 'prices' ? 1 : 0
      return {
        ...item,
        currentPrice: mode === 'prices' || mode === 'both' ? item.refreshedPrice : item.currentPrice,
        lastCheckedAt: nowIso,
        // Never deactivate when availability status is unknown
        isPublished: item.isPublished,
      }
    }

    if (item.availabilityStatus === 'confirmed_out_of_stock') {
      confirmedUnavailableCount += 1
      const shouldDeactivate = mode === 'availability' || mode === 'both'
      if (shouldDeactivate && item.isPublished) {
        autoDeactivatedCount += 1
      }
      updatedCount += 1
      return {
        ...item,
        currentPrice: mode === 'prices' || mode === 'both' ? item.refreshedPrice : item.currentPrice,
        isPublished: shouldDeactivate ? false : item.isPublished,
        lastCheckedAt: nowIso,
      }
    }

    // in_stock
    updatedCount += 1
    return {
      ...item,
      currentPrice: mode === 'prices' || mode === 'both' ? item.refreshedPrice : item.currentPrice,
      lastCheckedAt: nowIso,
    }
  })

  return {
    mode,
    eligibleCount: catalog.length,
    updatedCount,
    failedCount,
    confirmedUnavailableCount,
    autoDeactivatedCount,
    unknownOrUnreachableSkippedCount,
    completedAt: nowIso,
    items: updatedItems,
  }
}
