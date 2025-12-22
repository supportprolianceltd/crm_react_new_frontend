import React, { useState, useEffect } from "react";

export const AnimatedCounter = React.memo(({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (displayValue !== value) {
      const duration = 1000;
      const frameDuration = 1000 / 60;
      const totalFrames = Math.round(duration / frameDuration);
      let frame = 0;
      const startValue = displayValue;

      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const currentValue = Math.round(
          startValue + (value - startValue) * progress
        );
        setDisplayValue(currentValue);

        if (frame === totalFrames) clearInterval(counter);
      }, frameDuration);

      return () => clearInterval(counter);
    }
  }, [value]);

  return <span>{displayValue}</span>;
});
