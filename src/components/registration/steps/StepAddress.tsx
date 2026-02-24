import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import type { RegistrationData } from "../RegisterWizard";

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const STATES = ["NY", "NJ", "CT", "PA", "MD", "DE"];

export const StepAddress = ({ data, updateData, onNext, onBack }: Props) => {
  const canProceed = data.address && data.city && data.state && data.zip;

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Step 3: Address & Residency</h2>

      <div>
        <Label htmlFor="address">Street Address</Label>
        <Input id="address" value={data.address} onChange={e => updateData({ address: e.target.value })} placeholder="123 Main Street" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={data.city} onChange={e => updateData({ city: e.target.value })} />
        </div>
        <div>
          <Label>State</Label>
          <Select value={data.state} onValueChange={v => updateData({ state: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="zip">ZIP Code</Label>
          <Input id="zip" value={data.zip} onChange={e => updateData({ zip: e.target.value })} maxLength={10} />
        </div>
      </div>

      {canProceed && (
        <div className="p-4 rounded-lg bg-success/10 border border-success/30 flex items-start gap-3">
          <MapPin className="w-5 h-5 text-success mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">Address will be verified after submission</p>
            <p className="text-xs text-muted-foreground">
              Your district will geocode this address and verify it falls within district boundaries during review.
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} disabled={!canProceed} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Next: Documents →
        </Button>
      </div>
    </div>
  );
};
