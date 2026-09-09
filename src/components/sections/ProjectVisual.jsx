import { useMemo } from "react";
import {
  SPOT,
  STRIKE_RANGE,
  gammaFlip,
  gexByStrike,
  netGex,
} from "./GammaProfile.js";
import "./ProjectVisual.css";

/* Generated figures for the project cards. They are not screenshots.
   The featured ES-ML-Trader card draws a live ladder instead; see
   OrderBook.jsx.

   The gamma figure is computed with the same maths the tool itself runs
   (GammaProfile.js) over a synthetic, deterministic option chain — the
   shape of its output rather than a capture of one. The card labels it. */

function Voxel() {
  /* Isometric block field with one column knocked out. */
  const cells = useMemo(() => {
    const out = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 9; c++) {
        /* A trench cut through the field, with ragged edges either side. */
        const gone =
          c === 4 || (c === 5 && (r === 1 || r === 3)) || (c === 3 && r === 2);
        out.push({ r, c, gone });
      }
    }
    return out;
  }, []);

  const W = 26;
  const H = 13;

  return (
    <svg viewBox="0 0 260 120" className="pv pv--voxel" role="img" aria-hidden="true">
      {cells.map(({ r, c, gone }) => {
        /* Origin chosen so the whole field, including the outer faces,
           stays inside the 260x120 viewBox at every cell. */
        const x = 104 + (c - r) * (W / 2);
        const y = 16 + (c + r) * (H / 2);
        return (
          <g
            key={`${r}-${c}`}
            className={`pv__cube ${gone ? "is-gone" : ""}`}
            style={{ "--d": `${(r + c) * 55}ms` }}
          >
            <path
              d={`M${x} ${y} l${W / 2} ${H / 2} l${-W / 2} ${H / 2} l${-W / 2} ${-H / 2} Z`}
              className="pv__top"
            />
            <path
              d={`M${x - W / 2} ${y + H / 2} l${W / 2} ${H / 2} v${H} l${-W / 2} ${-H / 2} Z`}
              className="pv__left"
            />
            <path
              d={`M${x + W / 2} ${y + H / 2} l${-W / 2} ${H / 2} v${H} l${W / 2} ${-H / 2} Z`}
              className="pv__right"
            />
          </g>
        );
      })}
    </svg>
  );
}

/* Dealer gamma exposure by strike — the figure the gamma regime tool
   produces. Geometry only; the maths is in GammaProfile.js.
   The 260x146 viewBox is 16:9, so this card's figure lines up with the
   video on the card beside it. */
const G_W = 260;
const G_H = 146;
const G_ZERO = 100; /* the y of zero GEX */
const G_UP = 64; /* px available to the largest positive bar */
const G_X0 = 9;
const G_X1 = 251;

function Gamma() {
  const model = useMemo(() => {
    const profile = gexByStrike();
    const [kLo, kHi] = STRIKE_RANGE;
    const xOf = (k) => G_X0 + ((k - kLo) / (kHi - kLo)) * (G_X1 - G_X0);

    const peak = Math.max(...profile.map(([, v]) => Math.abs(v)));
    const scale = G_UP / peak;
    const width = ((G_X1 - G_X0) / (profile.length - 1)) * 0.66;

    const bars = profile.map(([k, v]) => {
      const h = Math.abs(v) * scale;
      return {
        k,
        x: xOf(k) - width / 2,
        y: v >= 0 ? G_ZERO - h : G_ZERO,
        h: Math.max(h, 0.4), /* a flat strike still reads as a strike */
        up: v >= 0,
      };
    });

    const flip = gammaFlip();
    const net = netGex() / 1e9;

    return {
      bars,
      width,
      xFlip: xOf(flip),
      xSpot: xOf(SPOT),
      flipLabel: flip.toFixed(2),
      netLabel: `${net >= 0 ? "+" : "−"}$${Math.abs(net).toFixed(2)}B / 1%`,
      /* The tool's own thresholds: +/-1B net GEX per 1% move. */
      regime: net >= 1 ? "LONG GAMMA" : net <= -1 ? "SHORT GAMMA" : "TRANSITIONAL",
    };
  }, []);

  return (
    <svg
      viewBox={`0 0 ${G_W} ${G_H}`}
      className="pv pv--gamma"
      role="img"
      aria-hidden="true"
    >
      <text x={G_X0} y="16" className="pv__g-regime">
        {model.regime}
      </text>
      <text x={G_X1} y="16" className="pv__g-net" textAnchor="end">
        {model.netLabel}
      </text>

      {model.bars.map((b, i) => (
        <rect
          key={b.k}
          x={b.x}
          y={b.y}
          width={model.width}
          height={b.h}
          rx="0.7"
          className={`pv__g-bar ${b.up ? "is-pos" : "is-neg"}`}
          style={{ "--d": `${240 + i * 16}ms`, "--zero": `${G_ZERO}px` }}
        />
      ))}

      <line x1={G_X0 - 3} y1={G_ZERO} x2={G_X1 + 3} y2={G_ZERO} className="pv__axis" />

      {/* Spot sits above the flip, which is what makes this long gamma.
          Both labels hang over the quiet side of their own line. */}
      <g className="pv__g-mark">
        <line x1={model.xSpot} y1="36" x2={model.xSpot} y2={G_ZERO} className="pv__g-spot" />
        <text x={model.xSpot - 4} y="32" className="pv__g-tag" textAnchor="end">
          SPOT {SPOT}
        </text>
      </g>

      <g className="pv__g-mark pv__g-mark--flip">
        <line x1={model.xFlip} y1="44" x2={model.xFlip} y2="122" className="pv__g-flip" />
        <circle cx={model.xFlip} cy={G_ZERO} r="2.6" className="pv__g-dot" />
        <text x={model.xFlip + 5} y="134" className="pv__g-tag is-flip">
          FLIP {model.flipLabel}
        </text>
      </g>

      {/* The tool's maths over a made-up chain. Say so on the figure. */}
      <text x={G_X1} y="134" className="pv__g-note" textAnchor="end">
        SYNTHETIC CHAIN
      </text>
    </svg>
  );
}

const MOTIFS = { voxel: Voxel, gamma: Gamma };

export default function ProjectVisual({ motif }) {
  const Motif = MOTIFS[motif];
  if (!Motif) return null;
  return (
    <div className="pv__frame" aria-hidden="true">
      <Motif />
    </div>
  );
}
