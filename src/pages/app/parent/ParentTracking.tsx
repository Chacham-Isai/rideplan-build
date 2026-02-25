import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, Clock, Bell, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ParentTracking = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("student_registrations")
      .select("*")
      .eq("parent_user_id", user.id)
      .eq("status", "approved")
      .then(({ data }) => {
        setChildren(data ?? []);
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">Real-Time Bus Tracking</h1>
        <p className="text-sm text-muted-foreground">Coming Soon</p>
      </div>

      {/* Animated bus illustration */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardContent className="p-8 text-center relative">
          <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl flex items-center justify-center relative overflow-hidden">
            {/* Animated road */}
            <div className="absolute bottom-8 left-0 right-0 h-1 bg-muted-foreground/20" />
            <div className="absolute bottom-8 left-0 right-0 flex gap-4 justify-center">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-8 h-0.5 bg-muted-foreground/30" />
              ))}
            </div>

            {/* Animated bus */}
            <motion.div
              animate={{ x: [-120, 120] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Bus className="h-16 w-16 text-amber-500" />
            </motion.div>
          </div>

          <div className="mt-6 space-y-2">
            <h2 className="text-lg font-semibold text-foreground">GPS Tracking Launching Soon</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              You'll be able to track your child's bus in real-time, see estimated arrival times, and receive notifications when the bus is nearby.
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <p className="text-xs text-primary font-medium">You'll be notified when tracking goes live</p>
          </div>
        </CardContent>
      </Card>

      {/* Bus assignments */}
      {children.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">Your Children's Bus Assignments</h2>
          <div className="space-y-3">
            {children.map((child) => (
              <Card key={child.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <Bus className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground text-sm">{child.student_name}</h3>
                    <p className="text-xs text-muted-foreground">Grade {child.grade} · {child.school}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                      Approved
                    </Badge>
                    <p className="text-[10px] text-muted-foreground">Bus assignment pending</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {children.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">No approved registrations yet. Bus tracking will be available once your child is approved for transportation.</p>
          </CardContent>
        </Card>
      )}

      {/* Feature preview cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: MapPin, label: "Live Map", desc: "See your bus on a real-time map" },
          { icon: Clock, label: "ETA Updates", desc: "Estimated arrival at your stop" },
          { icon: Bell, label: "Notifications", desc: "Alerts when bus is nearby" },
        ].map((f) => (
          <Card key={f.label} className="border-0 shadow-sm opacity-60">
            <CardContent className="p-4 text-center">
              <f.icon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">{f.label}</p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParentTracking;
