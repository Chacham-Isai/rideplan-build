import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { RegistrationData } from "../RegisterWizard";

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const StepChildcare = ({ data, updateData, onNext, onBack }: Props) => {
  const childcare = data.childcare || { providerName: "", providerAddress: "", days: [], transportType: "both" as const };

  const updateChildcare = (field: string, value: any) => {
    updateData({ childcare: { ...childcare, [field]: value } });
  };

  const toggleDay = (day: string) => {
    const days = childcare.days.includes(day)
      ? childcare.days.filter(d => d !== day)
      : [...childcare.days, day];
    updateChildcare("days", days);
  };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Step 5: Childcare Transportation</h2>

      <label className="flex items-center gap-3">
        <Checkbox
          checked={data.needsChildcare}
          onCheckedChange={v => updateData({ needsChildcare: !!v })}
        />
        <span className="text-sm font-medium">My child needs bus transportation to/from a childcare location</span>
      </label>

      {data.needsChildcare && (
        <div className="space-y-4 pl-1">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription className="text-xs">
              Under NY Education Law §3635(1)(e), districts may provide K-8 transportation between school and childcare locations within the district. Requests must be submitted by April 1.
            </AlertDescription>
          </Alert>

          <div>
            <Label>Childcare Provider Name</Label>
            <Input value={childcare.providerName} onChange={e => updateChildcare("providerName", e.target.value)} />
          </div>

          <div>
            <Label>Provider Address</Label>
            <Input value={childcare.providerAddress} onChange={e => updateChildcare("providerAddress", e.target.value)} placeholder="Must be within district boundaries" />
          </div>

          <div>
            <Label className="mb-2 block">Days Needed</Label>
            <div className="flex flex-wrap gap-3">
              {DAYS.map(day => (
                <label key={day} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={childcare.days.includes(day)} onCheckedChange={() => toggleDay(day)} />
                  {day.slice(0, 3)}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Transportation Type</Label>
            <Select value={childcare.transportType} onValueChange={v => updateChildcare("transportType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="am">AM Pickup Only</SelectItem>
                <SelectItem value="pm">PM Dropoff Only</SelectItem>
                <SelectItem value="both">Both AM & PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>← Back</Button>
        <Button onClick={onNext} className="bg-accent text-accent-foreground hover:bg-accent/90">
          Next: Review & Sign →
        </Button>
      </div>
    </div>
  );
};
