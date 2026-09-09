import { useCallback, useEffect, useMemo, useState } from "react";

import Nav from "./components/layout/Nav.jsx";
import ScrollProgress from "./components/layout/ScrollProgress.jsx";
import Footer from "./components/layout/Footer.jsx";
import Hero from "./components/hero/Hero.jsx";
import Projects from "./components/sections/Projects.jsx";
import Research from "./components/sections/Research.jsx";
import Skills from "./components/sections/Skills.jsx";
import Background from "./components/sections/Background.jsx";
import About from "./components/sections/About.jsx";
import Contact from "./components/sections/Contact.jsx";
import CommandPalette from "./components/ui/CommandPalette.jsx";
import Blueprint from "./components/ui/Blueprint.jsx";
import Ambient from "./components/ui/Ambient.jsx";

import useReducedMotion, { useMotionFlag } from "./hooks/useReducedMotion.js";
import useScrollSpy from "./hooks/useScrollSpy.js";
import useTheme from "./hooks/useTheme.js";
import useKonami from "./hooks/useKonami.js";

import { EMAIL, GITHUB, INSTAGRAM, SECTIONS } from "./data/profile.js";
import { PROJECTS } from "./data/projects.js";

const SPY_IDS = ["top", ...SECTIONS.map((s) => s.id)];

export default function App() {
  const reduced = useReducedMotion();
  useMotionFlag(reduced);

  const [theme, toggleTheme] = useTheme();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [egg, setEgg] = useState(false);

  const active = useScrollSpy(SPY_IDS, 140);

  useKonami(useCallback(() => setEgg((e) => !e), []));

  const goTo = useCallback(
    (hash) => {
      const el = document.querySelector(hash);
      if (!el) return;
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", hash);
    },
    [reduced]
  );

  const commands = useMemo(() => {
    const open = (href) => () => window.open(href, "_blank", "noopener,noreferrer");

    return [
      ...SECTIONS.map((s) => ({
        id: `go-${s.id}`,
        label: s.label,
        group: "Section",
        mark: "#",
        run: () => goTo(`#${s.id}`),
      })),
      {
        id: "go-top",
        label: "Back to top",
        group: "Section",
        mark: "#",
        run: () => goTo("#top"),
      },
      ...PROJECTS.filter((p) => p.links.length).map((p) => ({
        id: `pj-${p.id}`,
        label: p.title,
        group: "Project",
        mark: "↗",
        run: open(p.links[0].href),
      })),
      {
        id: "mail",
        label: `Email — ${EMAIL}`,
        group: "Link",
        mark: "@",
        run: () => {
          window.location.href = `mailto:${EMAIL}`;
        },
      },
      {
        id: "copy",
        label: "Copy email address",
        group: "Action",
        mark: "⧉",
        run: () => navigator.clipboard?.writeText(EMAIL).catch(() => {}),
      },
      { id: "gh", label: "GitHub", group: "Link", mark: "↗", run: open(GITHUB) },
      {
        id: "ig",
        label: "Instagram",
        group: "Link",
        mark: "↗",
        run: open(INSTAGRAM),
      },
      {
        id: "theme",
        label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        group: "Action",
        mark: "◐",
        run: toggleTheme,
      },
    ];
  }, [goTo, theme, toggleTheme]);

  /* ⌘K / Ctrl-K anywhere, and "/" when nothing else has focus. */
  useEffect(() => {
    const onKey = (e) => {
      const typing =
        e.target instanceof HTMLElement &&
        (e.target.tagName === "INPUT" ||
          e.target.tagName === "TEXTAREA" ||
          e.target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (e.key === "/" && !typing && !paletteOpen) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paletteOpen]);

  return (
    <>
      <a className="u-skip" href="#main">
        Skip to content
      </a>

      <Ambient />

      <ScrollProgress />

      <Nav
        sections={SECTIONS}
        active={active}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenPalette={() => setPaletteOpen(true)}
      />

      <main id="main" tabIndex={-1}>
        <Hero reduced={reduced} theme={theme} />
        <Projects />
        <Research />
        <Skills />
        <Background />
        <About />
        <Contact />
      </main>

      <Footer />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        commands={commands}
      />

      <Blueprint on={egg} onExit={() => setEgg(false)} />
    </>
  );
}
