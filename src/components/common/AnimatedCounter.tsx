import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Props {
  value: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<Props> = ({ value, className = '', prefix = '', suffix = '' }) => {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));
  const [renderedValue, setRenderedValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    return display.on('change', (latest) => {
      setRenderedValue(latest);
    });
  }, [display]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {renderedValue.toLocaleString()}
      {suffix}
    </span>
  );
};
