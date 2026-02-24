import { motion } from "framer-motion";

const routes = [
  // Route 1: top-left to school (center-right)
  { path: "M 40 60 Q 80 40, 140 80 Q 200 120, 300 90 Q 370 70, 420 110", color: "#2563eb", delay: 0 },
  // Route 2: bottom-left curving up to school
  { path: "M 20 280 Q 80 240, 160 260 Q 240 280, 320 220 Q 380 170, 420 110", color: "#3b82f6", delay: 1.5 },
  // Route 3: top-right sweeping down to school
  { path: "M 520 40 Q 480 80, 500 140 Q 510 180, 460 150 Q 440 130, 420 110", color: "#1d4ed8", delay: 3 },
  // Route 4: bottom-right to school
  { path: "M 540 300 Q 500 260, 480 220 Q 460 180, 440 140 Q 430 120, 420 110", color: "#60a5fa", delay: 0.8 },
  // Route 5: mid-left to school
  { path: "M 10 170 Q 80 150, 160 170 Q 250 190, 330 150 Q 380 130, 420 110", color: "#93c5fd", delay: 2.2 },
];

const stops = [
  { x: 40, y: 60 }, { x: 140, y: 80 }, { x: 300, y: 90 },
  { x: 20, y: 280 }, { x: 160, y: 260 }, { x: 320, y: 220 },
  { x: 520, y: 40 }, { x: 500, y: 140 },
  { x: 540, y: 300 }, { x: 480, y: 220 },
  { x: 10, y: 170 }, { x: 160, y: 170 }, { x: 330, y: 150 },
];

const Bus = ({ path, delay, color }: { path: string; delay: number; color: string }) => (
  <g>
    {/* Route line */}
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="8 4"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay: delay * 0.3, ease: "easeOut" }}
    />
    {/* Animated bus */}
    <motion.g
      initial={{ offsetDistance: "0%" }}
      animate={{ offsetDistance: "100%" }}
      transition={{
        duration: 6 + delay,
        repeat: Infinity,
        ease: "linear",
        delay: delay * 0.5,
      }}
    >
      <animateMotion
        dur={`${6 + delay}s`}
        repeatCount="indefinite"
        begin={`${delay * 0.5}s`}
        path={path}
        rotate="auto"
      >
      </animateMotion>
      {/* Bus body */}
      <rect x="-14" y="-8" width="28" height="16" rx="4" fill={color} />
      <rect x="-14" y="-8" width="28" height="16" rx="4" fill="hsl(43, 96%, 56%)" />
      {/* Windows */}
      <rect x="-10" y="-5" width="6" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="-2" y="-5" width="6" height="5" rx="1" fill="white" opacity="0.9" />
      <rect x="6" y="-5" width="6" height="5" rx="1" fill="white" opacity="0.9" />
      {/* Wheels */}
      <circle cx="-8" cy="8" r="2.5" fill="#1e293b" />
      <circle cx="8" cy="8" r="2.5" fill="#1e293b" />
    </motion.g>
  </g>
);

export const AnimatedRouteMap = () => (
  <div className="relative w-full rounded-2xl bg-gradient-to-br from-[#eef2ff] to-[#f0f4ff] shadow-xl overflow-hidden border border-border/50">
    <svg
      viewBox="0 0 560 340"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid pattern */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Roads */}
      {[60, 140, 220, 300].map((y) => (
        <rect key={`h-${y}`} x="0" y={y - 4} width="560" height="8" rx="2" fill="#c7d2fe" opacity="0.3" />
      ))}
      {[100, 200, 320, 440].map((x) => (
        <rect key={`v-${x}`} x={x - 4} y="0" width="8" height="340" rx="2" fill="#c7d2fe" opacity="0.3" />
      ))}

      {/* Bus routes with animated buses */}
      {routes.map((r, i) => (
        <Bus key={i} path={r.path} delay={r.delay} color={r.color} />
      ))}

      {/* Bus stops (pins) */}
      {stops.map((s, i) => (
        <g key={i}>
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, duration: 0.4, type: "spring" }}
          >
            {/* Pin shadow */}
            <ellipse cx={s.x} cy={s.y + 8} rx="4" ry="2" fill="#000" opacity="0.1" />
            {/* Pin */}
            <path
              d={`M ${s.x} ${s.y - 12} C ${s.x - 7} ${s.y - 12}, ${s.x - 7} ${s.y - 2}, ${s.x} ${s.y + 2} C ${s.x + 7} ${s.y - 2}, ${s.x + 7} ${s.y - 12}, ${s.x} ${s.y - 12} Z`}
              fill="hsl(43, 96%, 56%)"
            />
            <circle cx={s.x} cy={s.y - 7} r="2.5" fill="white" />
          </motion.g>
        </g>
      ))}

      {/* School building */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        {/* Building shadow */}
        <ellipse cx="420" cy="130" rx="30" ry="6" fill="#000" opacity="0.08" />
        {/* Building base */}
        <rect x="395" y="85" width="50" height="40" rx="3" fill="#1e3a5f" />
        {/* Roof */}
        <polygon points="390,85 420,65 450,85" fill="#1e3a5f" />
        {/* Roof accent */}
        <polygon points="395,85 420,70 445,85" fill="hsl(43, 96%, 56%)" opacity="0.3" />
        {/* Door */}
        <rect x="414" y="105" width="12" height="20" rx="2" fill="hsl(43, 96%, 56%)" />
        {/* Windows */}
        <rect x="400" y="92" width="8" height="8" rx="1" fill="#a7c7e7" />
        <rect x="432" y="92" width="8" height="8" rx="1" fill="#a7c7e7" />
        {/* Flag */}
        <line x1="420" y1="65" x2="420" y2="52" stroke="#1e3a5f" strokeWidth="1.5" />
        <motion.rect
          x="420" y="52" width="12" height="8" rx="1" fill="hsl(43, 96%, 56%)"
          animate={{ scaleX: [1, 0.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "420px 56px" }}
        />
      </motion.g>

      {/* Pulsing ring at school */}
      <motion.circle
        cx="420" cy="110"
        r="35"
        fill="none"
        stroke="hsl(43, 96%, 56%)"
        strokeWidth="1.5"
        animate={{ r: [35, 50, 35], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  </div>
);
