import { useEffect } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/* Fires once the sequence is entered. Ignores keystrokes aimed at a text
   field so it can never swallow typing in the command palette. */
export default function useKonami(onUnlock) {
  useEffect(() => {
    let i = 0;

    const onKey = (e) => {
      const el = e.target;
      if (
        el instanceof HTMLElement &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable)
      ) {
        return;
      }

      const want = SEQUENCE[i];
      const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      i = got === want ? i + 1 : got === SEQUENCE[0] ? 1 : 0;

      if (i === SEQUENCE.length) {
        i = 0;
        onUnlock();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onUnlock]);
}
