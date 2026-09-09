import { Suspense, lazy, useState } from "react";
import Button from "../ui/Button.jsx";
import SplitText from "../ui/SplitText.jsx";
import { NAME, ROLE, SUMMARY, TAGLINE } from "../../data/profile.js";
import { PALETTE } from "../../theme.js";
import "./Hero.css";

/* three.js is ~160 kB gzipped — the largest thing on the page by far, and
   nothing above the fold depends on it. Split it out so first paint is the
   CSS backdrop and the type. */
const DepthSurface = lazy(() => import("./DepthSurface.jsx"));

const STATS = [
  { v: "20.6 GB", k: "order-book data" },
  { v: "47,958,325", k: "bars reconstructed" },
  { v: "5", k: "walk-forward folds" },
  { v: "0", k: "lookahead violations" },
];

export default function Hero({ reduced, theme }) {
  const [ready, setReady] = useState(false);
  const palette = PALETTE[theme] ?? PALETTE.dark;

  return (
    <section id="top" className="hero" aria-labelledby="hero-name">
      <div className="hero__bg">
        <div className="hero__grid" aria-hidden="true" />
        <div className={`hero__gl-wrap ${ready ? "is-ready" : ""}`}>
          <Suspense fallback={null}>
            <DepthSurface
              reduced={reduced}
              palette={palette}
              onReady={() => setReady(true)}
            />
          </Suspense>
        </div>
        <div className="hero__scrim" aria-hidden="true" />
      </div>

      <p className="hero__note enter-fade" style={{ "--d": "900ms" }}>
        Limit order book depth over time. Illustrative, not live market data.
        <span className="hero__note-drag"> Drag to rotate.</span>
      </p>

      <div className="u-container hero__in par-out">
        <p className="hero__eyebrow enter" style={{ "--d": "80ms" }}>
          <span className="hero__dot" aria-hidden="true" />
          {ROLE}
        </p>

        <h1 id="hero-name" className="hero__name">
          <SplitText text={NAME} delay={170} step={70} />
        </h1>

        <p className="hero__tag enter" style={{ "--d": "560ms" }}>
          {TAGLINE}
        </p>

        <p className="hero__sum enter" style={{ "--d": "660ms" }}>
          {SUMMARY}
        </p>

        <div className="hero__cta enter" style={{ "--d": "760ms" }}>
          <Button href="#research" variant="primary" arrow>
            Read the research
          </Button>
          <Button href="#contact" variant="ghost">
            Get in touch
          </Button>
        </div>
      </div>

      <div className="u-container hero__foot">
        <ul className="hero__stats enter-fade" style={{ "--d": "880ms" }}>
          {STATS.map((s) => (
            <li key={s.k}>
              <span className="hero__stat-v u-mono u-num">{s.v}</span>
              <span className="hero__stat-k">{s.k}</span>
            </li>
          ))}
        </ul>
      </div>

      <a className="hero__cue enter-fade" style={{ "--d": "1100ms" }} href="#work">
        <span className="u-sr">Skip to the work</span>
        <span className="hero__cue-rail" aria-hidden="true" />
      </a>
    </section>
  );
}
