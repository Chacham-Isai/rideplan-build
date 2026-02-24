import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RegistrationData } from "../RegisterWizard";

const schema = z.object({
  parentName: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Valid email required").max(255),
  phone: z.string().min(10, "Valid phone number required").max(20),
  language: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Props = {
  data: RegistrationData;
  updateData: (d: Partial<RegistrationData>) => void;
  onNext: () => void;
};

const LANGUAGES = ["English", "Spanish", "Mandarin", "Haitian Creole", "Arabic", "Bengali"];

export const StepParentInfo = ({ data, updateData, onNext }: Props) => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      parentName: data.parentName,
      email: data.email,
      phone: data.phone,
      language: data.language,
      password: data.password,
    },
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateData(values);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h2 className="font-display text-xl font-bold text-primary">Step 1: Parent Information</h2>

      <div>
        <Label htmlFor="parentName">Full Name</Label>
        <Input id="parentName" {...register("parentName")} />
        {errors.parentName && <p className="text-sm text-destructive mt-1">{errors.parentName.message}</p>}
      </div>

      <div>
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" type="tel" {...register("phone")} />
        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <Label>Preferred Language</Label>
        <Select defaultValue={data.language} onValueChange={v => setValue("language", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="password">Create Password</Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
          Next: Student Info →
        </Button>
      </div>
    </form>
  );
};
