import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Navigation } from "@/components/sections/Navigation";
import { ContactFormModal } from "@/components/ContactFormModal";
import { RegisterWizard } from "@/components/registration/RegisterWizard";

const Register = () => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Register for Transportation"
        description="Digital registration for school bus transportation. Upload residency documents, verify your address, and get your child's bus assignment online."
        path="/register"
      />
      <Navigation onGetAudit={() => setContactOpen(true)} />
      <main className="pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider uppercase text-accent mb-4">
              <span className="w-10 h-px bg-accent" />
              Registration
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-3">
              Register for Transportation
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Complete the form below to register your child for school bus transportation.
              The process takes about 10 minutes.
            </p>
          </div>
          <RegisterWizard />
        </div>
      </main>
      <ContactFormModal open={contactOpen} onOpenChange={setContactOpen} />
    </div>
  );
};

export default Register;
