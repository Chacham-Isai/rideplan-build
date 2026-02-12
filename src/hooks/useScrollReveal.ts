import { useRef } from "react";
import { useInView } from "framer-motion";

export function useScrollReveal(once = true, margin: string = "-100px") {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: margin as any });
  return { ref, isInView };
}
