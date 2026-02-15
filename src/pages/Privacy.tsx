import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { Footer } from "@/components/sections/Footer";

const Privacy = () => (
  <div className="min-h-screen">
    <SEOHead
      title="Privacy Policy — RideLine"
      description="Learn how RideLine collects, uses, and protects your personal information."
    />
    <Navigation />
    <main className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-[800px] px-4 md:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: February 15, 2026</p>

        <div className="prose prose-neutral max-w-none space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, school district, and student count when you request a route audit or contact us. We also collect usage data automatically through cookies and analytics tools, including pages visited, time spent, and device information.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Provide and improve our transportation management platform</li>
              <li>Communicate with you about your account or requested services</li>
              <li>Send relevant updates, if you have opted in</li>
              <li>Analyze usage trends to improve user experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">3. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our platform, subject to confidentiality agreements. We may also disclose information when required by law or to protect our rights.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures, including encryption in transit and at rest, to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">5. Children's Privacy</h2>
            <p>Our platform is designed for use by school district administrators and parents. We do not knowingly collect personal information from children under 13 without parental consent, in compliance with COPPA.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data by contacting us. Depending on your jurisdiction, you may have additional rights under applicable data protection laws.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-foreground mb-3">8. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@rideline.com" className="text-accent hover:underline">privacy@rideline.com</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
