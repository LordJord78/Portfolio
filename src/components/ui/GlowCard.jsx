import { useCallback, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import "./GlowCard.css";

const MAX_TILT = 3.2; /* degrees — enough to read as depth, not as a gimmick */

/* A surface whose border glow follows the pointer and which tilts a few
   degrees toward it. Pointer writes go straight to CSS custom properties
   inside one rAF, so React never re-renders while the cursor moves. */
export default function GlowCard({
  as: Tag = "div",
  tilt = true,
  className = "",
  children,
  ...rest
}) {
  const ref = useRef(null);
  const frame = useRef(0);
  const next = useRef(null);
  const reduced = useReducedMotion();
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const active = fine && !reduced;

  const flush = useCallback(() => {
    frame.current = 0;
    const el = ref.current;
    const p = next.current;
    if (!el || !p) return;

    el.style.setProperty("--mx", `${p.x}px`);
    el.style.setProperty("--my", `${p.y}px`);

    if (tilt) {
      el.style.setProperty("--rx", `${(0.5 - p.ny) * 2 * MAX_TILT}deg`);
      el.style.setProperty("--ry", `${(p.nx - 0.5) * 2 * MAX_TILT}deg`);
    }
  }, [tilt]);

  const onMove = useCallback(
    (e) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      next.current = {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
        nx: (e.clientX - r.left) / r.width,
        ny: (e.clientY - r.top) / r.height,
      };

      if (!frame.current) frame.current = requestAnimationFrame(flush);
    },
    [active, flush]
  );

  const reset = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <Tag
      ref={ref}
      className={`glow ${active ? "is-live" : ""} ${className}`.trim()}
      onPointerMove={active ? onMove : undefined}
      onPointerLeave={active ? reset : undefined}
      {...rest}
    >
      <span className="glow__edge" aria-hidden="true" />
      <span className="glow__wash" aria-hidden="true" />
      <div className="glow__body">{children}</div>
    </Tag>
  );
}
