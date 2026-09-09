# Jordan Craig — portfolio

React + Vite + three.js. One page, no router, no CSS framework and no
animation library: design tokens live in `src/styles/tokens.css`, layout and
motion are plain CSS, and the only runtime dependency beyond React is three.js
for the hero.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm run lint     # eslint, flat config in eslint.config.js
npm run build    # outputs to dist/
npm run preview  # serve the production build locally
```

## Before this goes public

1. **Domain.** `.env` sets `VITE_SITE_URL`, which is substituted into
   `index.html` at build time for the canonical URL, the Open Graph tags and
   the JSON-LD. It is currently empty, so those resolve to root-relative
   paths: the page works, but link previews have no absolute image URL
   until the real origin is set (in `.env` or as a host environment
   variable).
2. **Gamma screenshot (optional).** The Gamma regime tool card shows a
   generated diagram, not a screenshot. To use a real one, give the project a
   `media` entry in `src/data/projects.js` — `{ src, poster, alt }`, the same
   shape the Voxel Trench Warfare card uses — and extend `ProjectMedia` to
   render an `<img>` when it is handed a still rather than a clip.

## Deploying

Push to GitHub, then import the repo at vercel.com. Vercel detects Vite with no
configuration and redeploys on every push to `main`. Set `VITE_SITE_URL` as an
environment variable in the project settings so the metadata points at the real
domain. You get a free `*.vercel.app` URL immediately; a custom domain can be
pointed at it later.

## Notes

- The Voxel Trench Warfare card plays a nine-second cut of a real screen
  capture: 1280×720, CRF 26, no audio, 1.0 MB, in `src/assets/trench.mp4`
  with a poster frame beside it. `ProjectMedia` swaps in the poster as a still
  image under `prefers-reduced-motion`, and pauses the clip when the card
  scrolls out of view. The 15 MB source capture stays out of the repository —
  see `.gitignore`.
- The hero is a WebGL limit-order-book depth surface: price across, time
  receding, resting size as height, drawn by a custom GLSL shader. The newest
  snapshot is the near edge; every 125 ms a row is pushed there and the
  oldest dropped off the far edge, while the mesh slides toward the far edge
  by the fraction of a row elapsed — so the rewrite lands exactly where the
  slide already was and nothing steps. Resting size carries over between
  snapshots (per-column AR(1) noise, decaying blocks, an eased mid), which is
  what makes it read as ridges of depth rather than a spike field.
  **The data is synthetic** — a shaped random walk, not a replay of a real
  session — and the page says so on screen. If that label is ever removed, the
  surface should be driven by real data first.
- The ES-ML-Trader card carries a live order-book ladder (`OrderBook.jsx`),
  also **synthetic** and labelled as such: size mean-reverts around a shaped
  profile, aggressive orders eat the touch and shift the book a tick, blocks
  arrive and decay. React renders the skeleton once; one rAF loop eases every
  displayed value toward its target and writes to the DOM directly — depth
  bars as `transform: scaleX`, text only when a rounded value changes, event
  flashes as Web Animations opacity fades. Rows are rank-anchored so the DOM
  order never changes. It pauses off screen and in hidden tabs, and renders a
  single static frame under reduced motion.
- The Gamma regime tool card draws dealer gamma exposure by strike — the
  figure that tool prints each morning. `GammaProfile.js` runs the same
  maths the tool runs: Black-Scholes gamma computed in-house rather than
  taken from a vendor's greeks, GEX per strike as gamma x OI x 100 x S² x
  1%, the flip located as the zero crossing of net GEX across hypothetical
  spot levels, and the walls as the gamma-weighted OI peak on each side.
  The **chain is synthetic** — shaped, deterministic, no random component,
  so the figure is identical on every render — and the figure says
  `SYNTHETIC CHAIN` on its face. The JS was checked against a Python
  reference of the tool's own functions: net GEX, the flip and both walls
  agree to floating-point precision. Its 260×146 viewBox is 16:9 so the
  card lines up with the video on the card beside it.
- The About portrait is a `<picture>` with a WebP source and PNG fallback.
  Because `<picture>` only falls back on an unsupported *type*, not on a
  failed decode, the `<img>` also swaps to the PNG on `error`.
- three.js is code-split behind `React.lazy`, so the initial bundle is ~62 kB
  gzipped and the ~118 kB three.js chunk loads after first paint. The hero
  render loop stops when the tab is hidden or the hero scrolls out of view, and
  drops to a lower grid resolution and pixel ratio on small screens.
- Two background layers move on their own: the ambient colour fields in
  `Ambient.jsx` animate `transform` only, so they stay on the compositor and
  never repaint, and the parallax classes in `styles/motion.css` use
  `animation-timeline: view()` behind an `@supports` guard — scroll-linked
  where the browser has it, static everywhere else, with no scroll listener
  either way.
- `prefers-reduced-motion` is respected in two places that agree with each
  other: CSS collapses every reveal, stagger, drift and transition, and
  `useReducedMotion` sets `<html data-motion="reduced">` and renders the
  surface as a single static frame with no animation loop. With the OS setting
  on, the page reports zero running animations.
- Dark is the default theme regardless of the OS setting; an explicit choice is
  stored in `localStorage` under `jc-theme` and applied inline in `index.html`
  before first paint, so there is no flash. The light palette is fully
  specified, including a different blend mode for the WebGL surface — additive
  reads as emitted light on black and washes out on white.
- The results in `src/data/results.js` come from
  `research/reports/data/economic_measurement.json`. If you re-run the
  measurement from a clean tree, update that file — and note the run those
  numbers came from had `code.dirty = true`.
- Every figure on the page traces back to `src/data/`. Nothing is rounded up
  and nothing is invented; the counters animate real measured values only.

## Keyboard

| Key | Action |
| --- | --- |
| `⌘K` / `Ctrl-K` | Open the command palette |
| `/` | Open the command palette |
| `↑` `↓` `↵` | Move and open inside the palette |
| `Esc` | Close the palette, or leave wireframe mode |
| `↑↑↓↓←→←→BA` | Wireframe mode |

## Layout

```
index.html            meta tags, JSON-LD, fonts, pre-paint theme
eslint.config.js      flat config; run with `npm run lint`
.env                  VITE_SITE_URL
public/
  favicon.svg
  og.png              1200×630 social card
  robots.txt
src/
  main.jsx            entry
  App.jsx             composition and global keyboard shortcuts
  theme.js            JS mirror of the palette, for the WebGL hero
  index.css           imports the three stylesheets below
  styles/
    tokens.css        colour, type, space, radius and motion tokens
    base.css          reset, document defaults, shared primitives
    motion.css        keyframes, reveal system, scroll-linked parallax,
                      reduced-motion collapse
  hooks/
    useReducedMotion.js  + useMotionFlag
    useMediaQuery.js
    useInView.js
    useScrollSpy.js
    useTheme.js
    useKonami.js
  components/
    layout/
      Nav.jsx            floating nav, scroll spy, mobile sheet
      ScrollProgress.jsx
      Section.jsx        shared section header
      Footer.jsx
    hero/
      Hero.jsx
      DepthSurface.jsx   the three.js + GLSL hero, lazy-loaded
    ui/
      Button.jsx  Reveal.jsx  SplitText.jsx  Counter.jsx
      Ambient.jsx        drifting background colour fields
      GlowCard.jsx       cursor-tracking glow and tilt
      CommandPalette.jsx ⌘K navigation
      ThemeToggle.jsx  Blueprint.jsx
    sections/
      Projects.jsx  ProjectVisual.jsx  ProjectMedia.jsx
      OrderBook.jsx      live synthetic ladder on the featured card
      GammaProfile.js    Black-Scholes GEX maths for the gamma figure
      Research.jsx  ResultsTable.jsx
      Skills.jsx  Background.jsx  About.jsx  Contact.jsx
  data/
    profile.js      name, email, links, section list
    background.js   standing, and the documented order of the ES-ML year
    projects.js     the three projects
    research.js     metrics, pipeline, methodology, limitations
    results.js      the eight measurements
    skills.js       the stack, with what evidences each entry
  assets/
    headshot.png  headshot.webp
content/
  es-ml-trader-project-page.md   long-form source for the write-up
```
