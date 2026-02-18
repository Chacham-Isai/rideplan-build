import { useState, lazy, Suspense } from "react";
import { SEOHead } from "@/components/SEOHead";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { ContactFormModal } from "@/components/ContactFormModal";
import { ChatWidget } from "@/components/ChatWidget";
import { BackToTop } from "@/components/BackToTop";
import { ScrollReveal } from "@/components/ScrollReveal";

// Lazy-load below-the-fold sections
const ProblemSection = lazy(() => import("@/components/sections/ProblemSection").then(m => ({ default: m.ProblemSection })));
const PlatformSection = lazy(() => import("@/components/sections/PlatformSection").then(m => ({ default: m.PlatformSection })));
const WhoWeServeSection = lazy(() => import("@/components/sections/WhoWeServeSection").then(m => ({ default: m.WhoWeServeSection })));
const ComparisonTable = lazy(() => import("@/components/sections/ComparisonTable").then(m => ({ default: m.ComparisonTable })));
const ROISection = lazy(() => import("@/components/sections/ROISection").then(m => ({ default: m.ROISection })));
const ROICalculator = lazy(() => import("@/components/sections/ROICalculator").then(m => ({ default: m.ROICalculator })));
const PricingSection = lazy(() => import("@/components/sections/PricingSection").then(m => ({ default: m.PricingSection })));
const FeatureDeepDives = lazy(() => import("@/components/sections/FeatureDeepDives").then(m => ({ default: m.FeatureDeepDives })));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const QuestionsSection = lazy(() => import("@/components/sections/QuestionsSection").then(m => ({ default: m.QuestionsSection })));
const HowItWorks = lazy(() => import("@/components/sections/HowItWorks").then(m => ({ default: m.HowItWorks })));
const TestimonialBanner = lazy(() => import("@/components/sections/TestimonialBanner").then(m => ({ default: m.TestimonialBanner })));
const LiveStatsDashboard = lazy(() => import("@/components/sections/LiveStatsDashboard").then(m => ({ default: m.LiveStatsDashboard })));
const CoverageMapSection = lazy(() => import("@/components/sections/CoverageMapSection").then(m => ({ default: m.CoverageMapSection })));
const SafetyDriverSection = lazy(() => import("@/components/sections/SafetyDriverSection").then(m => ({ default: m.SafetyDriverSection })));
const CTASection = lazy(() => import("@/components/sections/CTASection").then(m => ({ default: m.CTASection })));

const Footer = lazy(() => import("@/components/sections/Footer").then(m => ({ default: m.Footer })));

const Index = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);

  return (
    <div className="min-h-screen">
      <SEOHead />
      <AnnouncementBar />
      <Navigation onGetAudit={openContact} />
      <main>
        <HeroSection onGetAudit={openContact} />
        <ScrollReveal direction="fade" duration={0.5}>
          <TrustBar />
        </ScrollReveal>
        <Suspense fallback={null}>
          <ScrollReveal direction="up">
            <ProblemSection />
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <PlatformSection />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <WhoWeServeSection />
          </ScrollReveal>
          <ScrollReveal direction="scale">
            <ComparisonTable />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <ROISection />
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <ROICalculator onGetAudit={openContact} />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <PricingSection onGetAudit={openContact} />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <SafetyDriverSection />
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <FeatureDeepDives />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <TestimonialsSection />
          </ScrollReveal>
          <ScrollReveal direction="fade">
            <QuestionsSection />
          </ScrollReveal>
          <ScrollReveal direction="up">
            <HowItWorks />
          </ScrollReveal>
          <ScrollReveal direction="scale">
            <TestimonialBanner />
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.1}>
            <LiveStatsDashboard />
          </ScrollReveal>
          <ScrollReveal direction="right" delay={0.1}>
            <CoverageMapSection />
          </ScrollReveal>
          <ScrollReveal direction="scale">
            <CTASection onGetAudit={openContact} />
          </ScrollReveal>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
      <ChatWidget />
      <BackToTop />
    </div>
  );
};

export default Index;
