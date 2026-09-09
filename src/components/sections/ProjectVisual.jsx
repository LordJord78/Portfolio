import { useMemo } from "react";
import "./ProjectVisual.css";

/* Decorative diagrams, one per project card. They illustrate the shape of
   the problem — they are not screenshots and are not presented as data.
   The featured ES-ML-Trader card draws a live ladder instead; see
   OrderBook.jsx. */

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

function Gamma() {
  /* Dealer gamma across strikes, with the flip point where it changes sign. */
  const { path, area } = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 60; i++) {
      const x = (i / 60) * 260;
      const t = (i / 60) * 2 - 1;
      const y = 58 - Math.tanh(t * 2.6) * 40 * (0.72 + 0.28 * Math.cos(t * 5.1));
      pts.push([x, y]);
    }
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    return { path: d, area: `${d} L260 58 L0 58 Z` };
  }, []);

  return (
    <svg viewBox="0 0 260 120" className="pv pv--gamma" role="img" aria-hidden="true">
      <line x1="0" y1="58" x2="260" y2="58" className="pv__axis" />
      <path d={area} className="pv__area" />
      <path d={path} className="pv__curve" />
      <g className="pv__flip">
        <line x1="130" y1="14" x2="130" y2="102" className="pv__flip-line" />
        <circle cx="130" cy="58" r="4" className="pv__flip-dot" />
      </g>
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
