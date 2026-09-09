import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./CommandPalette.css";

/* Subsequence match, so "vtw" finds "Voxel Trench Warfare". */
function score(query, text) {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  const direct = t.indexOf(q);
  if (direct === 0) return 3;
  if (direct > 0) return 2;

  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i += 1;
    if (i === q.length) return 1;
  }
  return -1;
}

export default function CommandPalette({ open, onClose, commands }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const panelRef = useRef(null);
  const restore = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return commands;
    return commands
      .map((c) => ({
        c,
        s: Math.max(score(query.trim(), c.label), score(query.trim(), c.group ?? "")),
      }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c);
  }, [query, commands]);

  useEffect(() => setCursor(0), [query, open]);

  useEffect(() => {
    if (!open) return;

    restore.current = document.activeElement;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const id = requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      cancelAnimationFrame(id);
      body.style.overflow = prevOverflow;
      setQuery("");
      if (restore.current instanceof HTMLElement) restore.current.focus();
    };
  }, [open]);

  const run = useCallback(
    (cmd) => {
      onClose();
      /* Let the dialog unmount before the command moves the page. */
      requestAnimationFrame(() => cmd.run());
    },
    [onClose]
  );

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const cmd = results[cursor];
      if (cmd) run(cmd);
    } else if (e.key === "Tab") {
      /* The dialog holds exactly one tab stop, so keep focus inside it. */
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-i="${cursor}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [cursor, open, results.length]);

  if (!open) return null;

  return (
    <div className="cp" role="presentation" onMouseDown={onClose}>
      <div
        ref={panelRef}
        className="cp__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="cp__field">
          <svg className="cp__glass" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.4" stroke="currentColor" strokeWidth="1.4" />
            <path d="m10.4 10.4 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="cp__input"
            type="text"
            role="combobox"
            value={query}
            placeholder="Jump to a section, project or link…"
            aria-label="Search sections, projects and links"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="cp-list"
            aria-activedescendant={results[cursor] ? `cp-opt-${cursor}` : undefined}
            autoComplete="off"
            spellCheck="false"
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="kbd">Esc</kbd>
        </div>

        <ul id="cp-list" ref={listRef} className="cp__list" role="listbox" aria-label="Results">
          {results.map((cmd, i) => (
            <li key={cmd.id} role="none">
              <button
                type="button"
                id={`cp-opt-${i}`}
                data-i={i}
                role="option"
                aria-selected={i === cursor}
                className={`cp__opt ${i === cursor ? "is-on" : ""}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => run(cmd)}
                tabIndex={-1}
              >
                <span className="cp__mark" aria-hidden="true">
                  {cmd.mark ?? "›"}
                </span>
                <span className="cp__label">{cmd.label}</span>
                {cmd.group ? <span className="cp__group">{cmd.group}</span> : null}
              </button>
            </li>
          ))}
        </ul>

        {results.length === 0 ? (
          <p className="cp__empty" role="status">
            Nothing matches “{query}”.
          </p>
        ) : null}

        <footer className="cp__foot">
          <span>
            <kbd className="kbd">↑</kbd>
            <kbd className="kbd">↓</kbd> move
          </span>
          <span>
            <kbd className="kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="kbd">Esc</kbd> close
          </span>
        </footer>
      </div>
    </div>
  );
}
