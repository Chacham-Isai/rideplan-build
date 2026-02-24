import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, MapPin, UserPlus } from "lucide-react";
import dashboardImg from "@/assets/rideline-dashboard.png";

const assignments = [
  { name: "Emma Rodriguez", school: "Lincoln Elementary", bus: "#42", stop: "Oak St & 3rd", status: "Assigned" },
  { name: "Jayden Kim", school: "Washington Middle", bus: "#17", stop: "Maple Ave", status: "Assigned" },
  { name: "Sofia Chen", school: "Lincoln Elementary", bus: "#42", stop: "Pine Rd & 5th", status: "Pending" },
  { name: "Aiden Patel", school: "Jefferson High", bus: "#08", stop: "Elm Dr", status: "Assigned" },
];

export const DashboardAnimated = () => {
  const [visibleRows, setVisibleRows] = useState(0);
  const [processingIdx, setProcessingIdx] = useState(-1);

  useEffect(() => {
    // Stagger rows appearing
    if (visibleRows < assignments.length) {
      const t = setTimeout(() => setVisibleRows((v) => v + 1), 1200);
      return () => clearTimeout(t);
    }
    // After all rows visible, start processing pending ones
    const pending = assignments.findIndex((a) => a.status === "Pending");
    if (pending >= 0 && processingIdx < 0) {
      const t = setTimeout(() => setProcessingIdx(pending), 1500);
      return () => clearTimeout(t);
    }
  }, [visibleRows, processingIdx]);

  // Reset loop
  useEffect(() => {
    if (processingIdx >= 0) {
      const t = setTimeout(() => {
        setVisibleRows(0);
        setProcessingIdx(-1);
      }, 6000);
      return () => clearTimeout(t);
    }
  }, [processingIdx]);

  return (
    <div className="relative">
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-accent/10 to-success/5 blur-xl opacity-60" />
      <img
        src={dashboardImg}
        alt="RideLine student assignment dashboard"
        className="relative w-full rounded-2xl shadow-xl"
        loading="lazy"
      />

      {/* Overlay: simulated active table */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Semi-transparent overlay on bottom portion */}
        <div className="absolute bottom-0 left-0 right-0 h-[55%] bg-gradient-to-t from-white/95 via-white/90 to-transparent" />

        {/* Simulated table rows */}
        <div className="absolute bottom-3 left-3 right-3 space-y-1.5">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between px-3 py-1.5"
          >
            <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Assignments</span>
            <motion.div
              className="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold"
              style={{ color: "hsl(43, 96%, 40%)" }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <UserPlus className="h-3 w-3" />
              Live
            </motion.div>
          </motion.div>

          <AnimatePresence>
            {assignments.slice(0, visibleRows).map((a, i) => {
              const isProcessing = i === processingIdx;
              const justAssigned = isProcessing && processingIdx >= 0;

              return (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="flex items-center justify-between rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-[8px] sm:text-[9px] font-bold text-blue-600">
                        {a.name.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] sm:text-[10px] font-semibold text-gray-800 truncate">{a.name}</p>
                      <p className="text-[8px] sm:text-[9px] text-gray-400 truncate">
                        <span className="hidden sm:inline">{a.school} · </span>Bus {a.bus} · <MapPin className="inline h-2 w-2" /> {a.stop}
                      </p>
                    </div>
                  </div>

                  <motion.span
                    className={`flex-shrink-0 ml-2 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] sm:text-[9px] font-semibold ${
                      justAssigned
                        ? "bg-green-100 text-green-700"
                        : a.status === "Assigned"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                    animate={
                      isProcessing
                        ? { scale: [1, 1.15, 1], backgroundColor: ["#fef3c7", "#dcfce7", "#dcfce7"] }
                        : {}
                    }
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    {(a.status === "Assigned" || justAssigned) && <Check className="h-2.5 w-2.5" />}
                    {justAssigned ? "Assigned" : a.status}
                  </motion.span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
