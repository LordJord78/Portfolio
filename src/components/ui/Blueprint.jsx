import { useEffect } from "react";
import "./Blueprint.css";

/* Easter egg: the Konami code puts the page into a wireframe "inspect"
   mode. Purely decorative — the overlay never takes pointer events, and
   Escape (or the code again) turns it off. */
export default function Blueprint({ on, onExit }) {
  useEffect(() => {
    const root = document.documentElement;
    if (on) root.setAttribute("data-egg", "on");
    else root.removeAttribute("data-egg");
    return () => root.removeAttribute("data-egg");
  }, [on]);

  useEffect(() => {
    if (!on) return;
    const onKey = (e) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, onExit]);

  if (!on) return null;

  return (
    <div className="bp" aria-hidden="true">
      <div className="bp__grid" />
      <p className="bp__toast u-mono">
        <span className="bp__toast-dot" />
        wireframe mode · layout bounds visible ·{" "}
        <span className="bp__toast-key">esc</span> to exit
      </p>
    </div>
  );
}
