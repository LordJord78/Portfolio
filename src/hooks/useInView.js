import { useEffect, useRef, useState } from "react";

/* One-shot intersection flag. `once: false` keeps reporting, which is how
   the hero pauses its render loop when it scrolls off screen. */
export default function useInView({
  rootMargin = "0px 0px -12% 0px",
  threshold = 0,
  once = true,
  initial = false,
} = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(initial);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}
