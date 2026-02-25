import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Shield, Eye, ArrowRight } from "lucide-react";
import logoHorizontal from "@/assets/rideline-logo-horizontal.png";

interface DistrictOption {
  id: string;
  name: string;
  state: string;
  city: string | null;
}

const DemoLogin = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("districts" as any)
      .select("id, name, state, city")
      .not("slug", "is", null)
      .order("name")
      .then(({ data }: any) => {
        setDistricts((data as DistrictOption[]) ?? []);
        setLoading(false);
      });
  }, []);

  const handleEnter = (districtId: string, role: string) => {
    // Store demo intent in sessionStorage, redirect to login
    sessionStorage.setItem("demo_intent", JSON.stringify({ districtId, role }));
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <img src={logoHorizontal} alt="RideLine AI" className="h-10" />
        <Button variant="outline" size="sm" onClick={() => navigate("/")}>
          Back to Site
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center space-y-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-2">Demo Environment</Badge>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Experience RideLine AI
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Choose a district to explore the platform. Log in with your demo account, then select a district below.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {districts.map((d) => (
                <Card key={d.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{d.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {d.city ? `${d.city}, ` : ""}{d.state}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        onClick={() => handleEnter(d.id, "district_admin")}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Admin View
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        size="sm"
                        onClick={() => handleEnter(d.id, "parent")}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Parent View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Demo data is reset periodically. Changes you make won't affect production systems.
          </p>
        </div>
      </main>
    </div>
  );
};

export default DemoLogin;
