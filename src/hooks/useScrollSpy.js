import { useEffect, useState } from "react";

/* Reports which section id is currently under the navigation bar.
   Uses scroll position rather than intersection ratios so short sections
   next to tall ones still get their turn. */
export default function useScrollSpy(ids, offset = 120) {
  const [active, setActive] = useState(ids[0] ?? null);

  useEffect(() => {
    if (!ids.length) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const line = window.scrollY + offset;
      let current = ids[0];

      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= line) current = id;
      }

      /* Anything within a viewport-height of the bottom counts as the
         last section, otherwise short footers can never activate. */
      const atEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 24;
      if (atEnd) current = ids[ids.length - 1];

      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids, offset]);

  return active;
}
