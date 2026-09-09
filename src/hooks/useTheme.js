import { useCallback, useEffect, useState } from "react";

const KEY = "jc-theme";

/* Dark is the identity, so it is the default for a first-time visitor
   regardless of the OS setting. An explicit choice is remembered. */
export function readStoredTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "dark";
  } catch {
    return "dark";
  }
}

export default function useTheme() {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#fbfafd" : "#08070c");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode — the attribute above still applies for this visit */
    }
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  return [theme, toggle];
}
