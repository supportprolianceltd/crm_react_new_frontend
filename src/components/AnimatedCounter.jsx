import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

const AnimatedCounter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1 });
    return animation.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedCounter;
