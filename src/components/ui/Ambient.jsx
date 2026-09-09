import "./Ambient.css";

/* Two slow-drifting colour fields behind the whole page.
   Each blob is a single painted radial gradient animated on `translate`
   only, so the work stays on the compositor: no repaint, no layout, and
   nothing to schedule on the main thread. The CSS stops the animation
   under reduced motion and keeps the static wash. */
export default function Ambient() {
  return (
    <div className="aura" aria-hidden="true">
      <span className="aura__blob aura__blob--a" />
      <span className="aura__blob aura__blob--b" />
    </div>
  );
}
