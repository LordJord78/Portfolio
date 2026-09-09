import { useEffect, useRef, useState } from "react";
import useInView from "../../hooks/useInView.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";

const fmt = (n, decimals) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/* Counts a real measured value up when it scrolls into view. Never used for
   anything that isn't an actual number from src/data. */
export default function Counter({
  value,
  decimals = 0,
  suffix = "",
  duration = 1100,
  className = "",
}) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView({ rootMargin: "0px 0px -20% 0px" });
  const [shown, setShown] = useState(reduced ? value : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced || value === 0) {
      setShown(value);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(value * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [inView, reduced, value, duration]);

  const done = shown === value;

  return (
    <span ref={ref} className={`u-num ${className}`.trim()}>
      {fmt(done ? value : shown, decimals)}
      {suffix}
    </span>
  );
}
