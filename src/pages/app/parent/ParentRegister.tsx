import { useAuth } from "@/contexts/AuthContext";
import { useDistrict } from "@/contexts/DistrictContext";
import { RegisterWizard } from "@/components/registration/RegisterWizard";

const ParentRegister = () => {
  const { user } = useAuth();
  const { district, profile } = useDistrict();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Register a Student</h1>
        <p className="text-sm text-muted-foreground">
          Complete the form below to register your child for school bus transportation.
        </p>
      </div>
      <RegisterWizard
        mode="in-app"
        prefill={{
          parentName: profile?.full_name ?? user?.user_metadata?.full_name ?? "",
          email: profile?.email ?? user?.email ?? "",
          phone: profile?.phone ?? user?.user_metadata?.phone ?? "",
          districtId: district?.id ?? "",
        }}
      />
    </div>
  );
};

export default ParentRegister;
