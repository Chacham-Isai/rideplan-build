import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Bus, MapPin, Bell } from "lucide-react";
import parentAppImg from "@/assets/rideline-parent-app.png";

const notifications = [
  { icon: Bus, title: "Bus #42 is on the way", body: "Arriving at Oak St. stop in 3 minutes", time: "Just now" },
  { icon: MapPin, title: "Emma arrived at school", body: "Dropped off at Lincoln Elementary at 8:12 AM", time: "2m ago" },
  { icon: Bell, title: "Route change tomorrow", body: "Bus #42 will use the alternate Pine Ave route", time: "5m ago" },
];

export const ParentAppAnimated = () => {
  const [activeNotif, setActiveNotif] = useState(-1);

  useEffect(() => {
    const timer = setTimeout(() => setActiveNotif(0), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeNotif < 0) return;
    const timer = setTimeout(() => {
      setActiveNotif((prev) => (prev + 1) % notifications.length);
    }, 4000);
    return () => clearTimeout(timer);
  }, [activeNotif]);

  const notif = activeNotif >= 0 ? notifications[activeNotif] : null;

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-xl opacity-60" />
      <img
        src={parentAppImg}
        alt="Parent receiving real-time school bus notification on their phone"
        className="relative w-full rounded-2xl shadow-xl"
        loading="lazy"
      />

      {/* Animated notification toast */}
      <AnimatePresence mode="wait">
        {notif && (
          <motion.div
            key={activeNotif}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute top-4 left-4 right-4 z-10"
          >
            <div className="rounded-xl bg-white/95 backdrop-blur-md shadow-2xl shadow-black/20 border border-black/5 p-3.5 flex items-start gap-3">
              {/* App icon */}
              <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8922E] flex items-center justify-center shadow-md">
                <notif.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">RideLine</p>
                  <p className="text-[10px] text-gray-400">{notif.time}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-tight">{notif.title}</p>
                <p className="text-xs text-gray-500 leading-snug mt-0.5">{notif.body}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
