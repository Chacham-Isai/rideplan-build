import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, BarChart3, Users, MapPin, Shield, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Real-Time Dashboard",
    description: "Live fleet metrics, on-time performance, and route utilization",
  },
  {
    icon: MapPin,
    title: "Route Management",
    description: "Optimize routes, manage stops, and track efficiency",
  },
  {
    icon: Users,
    title: "Student Ridership",
    description: "Registration tracking, bus passes, and parent communications",
  },
  {
    icon: Shield,
    title: "Driver Compliance",
    description: "CDL tracking, certifications, and safety monitoring",
  },
];

const DISTRICTS = [
  {
    id: "lawrence" as const,
    name: "Lawrence USD",
    students: "8,302",
    routes: "47",
    description: "Large urban district — full fleet deployment",
  },
  {
    id: "oceanside" as const,
    name: "Oceanside USD",
    students: "5,124",
    routes: "32",
    description: "Mid-size coastal district — growing program",
  },
];

export default function DemoLogin() {
  const navigate = useNavigate();
  const { enableDemoMode, isDemoMode } = useDemoMode();
  const [loading, setLoading] = useState<string | null>(null);

  // If already in demo mode, redirect to dashboard
  useEffect(() => {
    if (isDemoMode) {
      navigate("/app/dashboard", { replace: true });
    }
  }, [isDemoMode, navigate]);

  const handleEnterDemo = async (districtId: "lawrence" | "oceanside") => {
    setLoading(districtId);
    try {
      enableDemoMode(districtId);
      // Small delay for UX
      await new Promise((r) => setTimeout(r, 400));
      navigate("/app/dashboard", { replace: true });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30">
          <Bus className="h-5 w-5 text-blue-400" />
        </div>
        <span className="text-white font-semibold text-lg">RidePlan</span>
        <Badge variant="outline" className="ml-2 text-blue-300 border-blue-500/40 text-xs">
          Demo
        </Badge>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-6">
            <Zap className="h-3.5 w-3.5" />
            Interactive Demo — No Login Required
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Student Transportation,{" "}
            <span className="text-blue-400">Simplified</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Explore RidePlan with realistic data from two sample districts.
            See exactly how your district could operate.
          </p>
        </div>

        {/* District selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-10">
          {DISTRICTS.map((district) => (
            <Card
              key={district.id}
              className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
              onClick={() => !loading && handleEnterDemo(district.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-base">{district.name}</CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    Sample
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-sm">
                  {district.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-slate-300 mb-4">
                  <span>
                    <span className="font-semibold text-white">{district.students}</span> students
                  </span>
                  <span>
                    <span className="font-semibold text-white">{district.routes}</span> routes
                  </span>
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!!loading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEnterDemo(district.id);
                  }}
                >
                  {loading === district.id ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Zap className="h-3.5 w-3.5" />
                      Explore {district.name}
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-slate-800/30 border border-slate-700/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-2">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <p className="text-white text-xs font-medium mb-1">{feature.title}</p>
                <p className="text-slate-500 text-xs">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Real login link */}
        <p className="mt-10 text-slate-500 text-sm">
          Have an account?{" "}
          <a href="/login" className="text-blue-400 hover:text-blue-300 underline">
            Sign in
          </a>
        </p>
      </main>
    </div>
  );
}
