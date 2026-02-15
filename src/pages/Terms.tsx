import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

const Terms = () => (
  <div className="min-h-screen">
    <SEOHead
      title="Terms of Service — RideLine"
      description="Review the terms and conditions governing the use of RideLine's school transportation platform."
    />
    <Navigation />
    <main className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-[800px] px-4 md:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: February 15, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using the RideLine platform and website, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. Description of Service</h2>
            <p>RideLine provides a school transportation management platform that includes route optimization, contractor oversight, parent communication tools, and compliance reporting for K–12 school districts.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree to notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the platform's functionality</li>
              <li>Reverse-engineer or copy any part of our software</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of the RideLine platform are owned by RideLine and are protected by copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, RideLine shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the platform at any time for violation of these terms, with or without notice.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">9. Changes to Terms</h2>
            <p>We may modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">10. Contact Us</h2>
            <p>For questions about these Terms, please contact us at <a href="mailto:legal@rideline.com" className="text-accent hover:underline">legal@rideline.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
