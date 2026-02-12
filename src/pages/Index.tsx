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

const Index = () => (
  <div className="min-h-screen">
    <AnnouncementBar />
    <Navigation />
    <main>
      <HeroSection />
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
      <CTASection />
    </main>
    <Footer />
  </div>
);

export default Index;
