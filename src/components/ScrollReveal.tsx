import { motion, Variants } from "framer-motion";
import { ReactNode, useRef } from "react";
import { useInView } from "framer-motion";

type RevealDirection = "up" | "down" | "left" | "right" | "scale" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  duration?: number;
  distance?: number;
}

const getVariants = (direction: RevealDirection, distance: number): Variants => {
  const hidden: Record<string, any> = { opacity: 0 };
  const visible: Record<string, any> = { opacity: 1 };

  switch (direction) {
    case "up":
      hidden.y = distance;
      visible.y = 0;
      break;
    case "down":
      hidden.y = -distance;
      visible.y = 0;
      break;
    case "left":
      hidden.x = distance;
      visible.x = 0;
      break;
    case "right":
      hidden.x = -distance;
      visible.x = 0;
      break;
    case "scale":
      hidden.scale = 0.96;
      visible.scale = 1;
      break;
    case "fade":
    default:
      break;
  }

  return { hidden, visible };
};

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  distance = 32,
}: ScrollRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const variants = getVariants(direction, distance);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
