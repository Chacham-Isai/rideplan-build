import { useState } from "react";
import { AnnouncementBar } from "@/components/sections/AnnouncementBar";
import { Navigation } from "@/components/sections/Navigation";
import { HeroSection } from "@/components/sections/HeroSection";
import { TrustBar } from "@/components/sections/TrustBar";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { PlatformSection } from "@/components/sections/PlatformSection";
import { ComparisonTable } from "@/components/sections/ComparisonTable";
import { ROISection } from "@/components/sections/ROISection";
import { FeatureDeepDives } from "@/components/sections/FeatureDeepDives";
import { QuestionsSection } from "@/components/sections/QuestionsSection";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { TestimonialBanner } from "@/components/sections/TestimonialBanner";
import { ByTheNumbers } from "@/components/sections/ByTheNumbers";
import { CTASection } from "@/components/sections/CTASection";
import { Footer } from "@/components/sections/Footer";
import { ContactFormModal } from "@/components/ContactFormModal";
import { ChatWidget } from "@/components/ChatWidget";

const Index = () => {
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);

  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Navigation onGetAudit={openContact} />
      <main>
        <HeroSection onGetAudit={openContact} />
        <TrustBar />
        <ProblemSection />
        <PlatformSection />
        <ComparisonTable />
        <ROISection />
        <FeatureDeepDives />
        <QuestionsSection />
        <HowItWorks />
        <TestimonialBanner />
        <ByTheNumbers />
        <CTASection onGetAudit={openContact} />
      </main>
      <Footer />
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
      <ChatWidget />
    </div>
  );
};

export default Index;
