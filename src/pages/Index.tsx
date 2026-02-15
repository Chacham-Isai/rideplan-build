import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { WhoWeServeSection } from "@/components/sections/WhoWeServeSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { ROISection } from "@/components/sections/ROISection";
import { ROICalculator } from "@/components/sections/ROICalculator";
import { FeatureDeepDives } from "@/components/sections/FeatureDeepDives";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { QuestionsSection } from "@/components/sections/QuestionsSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialBanner } from "@/components/sections/TestimonialBanner";
import { LiveStatsDashboard } from "@/components/sections/LiveStatsDashboard";
import { CoverageMapSection } from "@/components/sections/CoverageMapSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import { ChatWidget } from "@/components/ChatWidget";
import { BackToTop } from "@/components/BackToTop";

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
        <TrustBar />
        <ProblemSection />
        <PlatformSection />
        <WhoWeServeSection />
        <ComparisonTable />
        <ROISection />
        <ROICalculator onGetAudit={openContact} />
        <PricingSection onGetAudit={openContact} />
        <FeatureDeepDives />
        <TestimonialsSection />
        <QuestionsSection />
        <HowItWorks />
        <TestimonialBanner />
        <LiveStatsDashboard />
        <CoverageMapSection />
        <CTASection onGetAudit={openContact} />
      </main>
      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
      <ChatWidget />
      <BackToTop />
    </div>
  );
};

export default Index;
