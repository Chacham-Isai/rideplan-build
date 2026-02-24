import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import type { RegistrationData } from "../RegisterWizard";

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
};

export const StepReview = ({ data, updateData, onBack, onSubmit, submitting }: Props) => {
  const canSubmit = data.signatureText.length >= 2 && data.billOfRightsAcknowledged;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Step 6: Review & Sign</h2>

      {/* Summary */}
      <div className="space-y-3 text-sm">
        <div className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold text-primary">Parent</p>
          <p>{data.parentName} · {data.email} · {data.phone}</p>
        </div>

        {data.students.map((s, i) => (
          <div key={i} className="p-3 bg-secondary rounded-lg">
            <p className="font-semibold text-primary">Student {i + 1}</p>
            <p>{s.name} · Grade {s.grade} · {s.school}</p>
            {(s.iep || s.section504 || s.mckinneyVento || s.fosterCare) && (
              <p className="text-xs text-muted-foreground mt-1">
                Flags: {[s.iep && "IEP", s.section504 && "504", s.mckinneyVento && "McKinney-Vento", s.fosterCare && "Foster Care"].filter(Boolean).join(", ")}
              </p>
            )}
          </div>
        ))}

        <div className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold text-primary">Address</p>
          <p>{data.address}, {data.city}, {data.state} {data.zip}</p>
        </div>

        <div className="p-3 bg-secondary rounded-lg">
          <p className="font-semibold text-primary">Documents</p>
          <p>{data.documents.length} document(s) uploaded</p>
        </div>

        {data.needsChildcare && data.childcare && (
          <div className="p-3 bg-secondary rounded-lg">
            <p className="font-semibold text-primary">Childcare</p>
            <p>{data.childcare.providerName} · {data.childcare.days.length} days/week · {data.childcare.transportType.toUpperCase()}</p>
          </div>
        )}
      </div>

      {/* Bill of Rights */}
      <Accordion type="single" collapsible>
        <AccordionItem value="bor">
          <AccordionTrigger className="text-sm font-semibold">
            Parents' Bill of Rights for Data Privacy
          </AccordionTrigger>
          <AccordionContent className="text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
            Pursuant to New York Education Law §2-d and its implementing regulations, you have the right to:
            (1) inspect and review the complete contents of your child's education record;
            (2) be informed of all rights under federal and state law;
            (3) consent to disclosures of personally identifiable information;
            (4) file complaints about potential data breaches;
            (5) receive notification of data breaches affecting student data.
            The district maintains a Data Privacy and Security Plan available upon request.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <label className="flex items-start gap-3">
        <Checkbox
          checked={data.billOfRightsAcknowledged}
          onCheckedChange={v => updateData({ billOfRightsAcknowledged: !!v })}
          className="mt-0.5"
        />
        <span className="text-sm">
          I have read and acknowledge the Parents' Bill of Rights for Data Privacy.
        </span>
      </label>

      {/* Attestation */}
      <div className="p-4 border border-border rounded-lg bg-card">
        <p className="text-sm text-muted-foreground mb-3">
          I attest under penalty of perjury that the information provided above is true and accurate, and that I reside at the address stated.
        </p>
        <Label htmlFor="signature">Type your full legal name as your electronic signature</Label>
        <Input
          id="signature"
          value={data.signatureText}
          onChange={e => updateData({ signatureText: e.target.value })}
          placeholder="Your Full Legal Name"
          className="font-display italic text-lg"
        />
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || submitting}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Registration"}
        </Button>
      </div>
    </div>
  );
};
