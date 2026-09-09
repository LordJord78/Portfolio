import { useCallback, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import useMediaQuery from "../../hooks/useMediaQuery.js";
import "./GlowCard.css";

/* A surface whose border glow follows the pointer. Pointer writes go
   straight to CSS custom properties inside one rAF, so React never
   re-renders while the cursor moves.

   These cards used to tilt a few degrees toward the cursor as well. A
   rotation is a 3D transform, which composites the card into a texture and
   resamples everything inside it — fine over footage, but it softened the
   live order book and the gamma figure, so the tilt is gone. The glow and
   the lit edge are the whole hover response now, and they cost no raster. */
export default function GlowCard({ as: Tag = "div", className = "", children, ...rest }) {
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
  }, []);

  const onMove = useCallback(
    (e) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;

      const r = el.getBoundingClientRect();
      next.current = { x: e.clientX - r.left, y: e.clientY - r.top };

      if (!frame.current) frame.current = requestAnimationFrame(flush);
    },
    [active, flush]
  );

  /* Drop a queued frame on the way out; the wash fades on :hover, so the
     last position can stay where it was. */
  const reset = useCallback(() => {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
  }, []);

  return (
    <Tag
      ref={ref}
      className={`glow ${active ? "is-live" : ""} ${className}`.replace(/\s+/g, " ").trim()}
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
