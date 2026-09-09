import { useEffect, useState } from "react";

/* True when the OS asks for reduced motion. Also mirrored onto
   <html data-motion="reduced"> by useMotionFlag so CSS can react. */
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = (e) => setReduced(e.matches);
    setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  return reduced;
}

/* Publishes the flag to the document root once, at the top of the tree. */
export function useMotionFlag(reduced) {
  useEffect(() => {
    const root = document.documentElement;
    if (reduced) root.setAttribute("data-motion", "reduced");
    else root.removeAttribute("data-motion");
  }, [reduced]);
}
