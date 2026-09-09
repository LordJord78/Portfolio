import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import ThemeToggle from "../ui/ThemeToggle.jsx";
import "./Nav.css";

const isMac = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

export default function Nav({ sections, active, theme, onToggleTheme, onOpenPalette }) {
  const [stuck, setStuck] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mac, setMac] = useState(false);
  const listRef = useRef(null);
  const burgerRef = useRef(null);

  useEffect(() => setMac(isMac()), []);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setStuck(window.scrollY > 12);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /* Slide the highlight pill under whichever link is active. */
  const placeIndicator = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector('[data-on="true"]');
    if (!el) {
      list.style.setProperty("--ind-o", "0");
      return;
    }
    list.style.setProperty("--ind-x", `${el.offsetLeft}px`);
    list.style.setProperty("--ind-w", `${el.offsetWidth}px`);
    list.style.setProperty("--ind-o", "1");
  }, []);

  useLayoutEffect(placeIndicator, [active, placeIndicator]);

  useEffect(() => {
    window.addEventListener("resize", placeIndicator);
    if (document.fonts?.ready) document.fonts.ready.then(placeIndicator).catch(() => {});
    return () => window.removeEventListener("resize", placeIndicator);
  }, [placeIndicator]);

  /* Close the mobile sheet on Escape or on a resize back to desktop. */
  useEffect(() => {
    if (!menu) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        burgerRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 860) setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [menu]);

  return (
    <header className={`nav ${stuck ? "is-stuck" : ""} ${menu ? "is-open" : ""}`}>
      <div className="nav__bar">
        <a className="nav__mark" href="#top" aria-label="Jordan Craig — back to top">
          <span className="nav__glyph" aria-hidden="true">
            JC
          </span>
          <span className="nav__wordmark">Jordan Craig</span>
        </a>

        <nav className="nav__links" aria-label="Sections">
          <ul ref={listRef} className="nav__list">
            <li className="nav__ind" aria-hidden="true" />
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  className="nav__link"
                  href={`#${s.id}`}
                  data-on={active === s.id}
                  aria-current={active === s.id ? "true" : undefined}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__tools">
          <button
            type="button"
            className="nav__cmd"
            onClick={onOpenPalette}
            aria-label="Open command palette"
          >
            <svg
              className="nav__cmd-ic"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="m10.4 10.4 3 3"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span className="nav__cmd-label">Search</span>
            <kbd className="kbd">{mac ? "⌘" : "Ctrl"}</kbd>
            <kbd className="kbd">K</kbd>
          </button>

          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            ref={burgerRef}
            type="button"
            className="nav__burger"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-controls="nav-sheet"
            aria-label={menu ? "Close menu" : "Open menu"}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="nav-sheet" className="nav__sheet" hidden={!menu}>
        <ul className="nav__sheet-list">
          {sections.map((s, i) => (
            <li key={s.id} style={{ "--d": `${i * 45}ms` }}>
              <a
                href={`#${s.id}`}
                onClick={() => setMenu(false)}
                aria-current={active === s.id ? "true" : undefined}
              >
                <span className="nav__sheet-num u-mono">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
