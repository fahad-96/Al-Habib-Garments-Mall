import React from "react";
import { motion, useReducedMotion } from "framer-motion";

// In-view fade/slide reveal. Keep it subtle; premium means restraint.
export default function Reveal({ children, delay = 0, y = 14, className = "", once = true, as = "div" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <Comp className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once, margin: "-10% 0px" }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </Comp>
  );
}
