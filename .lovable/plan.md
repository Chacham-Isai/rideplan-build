

## Reorganize Homepage for Maximum Impact and Update Tagline

### Tagline Change
Update the hero headline from "Every Route. Every Dollar. Every Student." to **"Every Student. Every Day."** -- a cleaner, more emotionally resonant tagline that leads with what matters most.

### Section Reordering Strategy

The current homepage has 17+ sections. The new order front-loads the most impressive, attention-grabbing content to hook visitors immediately:

**Current order:**
1. Hero -> 2. TrustBar -> 3. ProblemSection -> 4. PlatformSection -> 5. WhoWeServe -> 6. ComparisonTable -> 7. ROISection -> 8. ROICalculator -> 9. PricingSection -> 10. SafetyDriverSection -> 11. FeatureDeepDives -> 12. TestimonialsSection -> 13. QuestionsSection -> 14. HowItWorks -> 15. TestimonialBanner -> 16. LiveStatsDashboard -> 17. CoverageMapSection -> 18. CTASection

**New order (impact-first):**
1. **Hero** (updated tagline)
2. **TrustBar** (social proof immediately)
3. **LiveStatsDashboard** (impressive real-time data -- grabs attention)
4. **PlatformSection** (show what the product does)
5. **ROISection** (hard dollar savings -- the hook for decision-makers)
6. **TestimonialsSection** (social proof while they're excited)
7. **ComparisonTable** (why RideLine vs. alternatives)
8. **FeatureDeepDives** (detailed capabilities)
9. **WhoWeServeSection** (personalized value props)
10. **SafetyDriverSection** (differentiator)
11. **ROICalculator** (interactive engagement)
12. **ProblemSection** (reinforce urgency)
13. **QuestionsSection** (provoke thought)
14. **HowItWorks** (reduce friction)
15. **TestimonialBanner** (reinforcement)
16. **PricingSection** (near the bottom, after value is established)
17. **CoverageMapSection** (nationwide credibility)
18. **CTASection** (final conversion)

### Technical Details

**Files to modify:**

1. **`src/components/sections/HeroSection.tsx`** -- Change the h1 from `"Every Route. Every Dollar. "` + `"Every Student."` to `"Every Student. "` + `"Every Day."`

2. **`src/pages/Index.tsx`** -- Reorder the lazy-loaded section components inside the Suspense block to match the new impact-first sequence described above. No new components are needed; this is purely a reorder of existing `ScrollReveal`-wrapped sections.

