import { GITHUB } from "./profile.js";

import trenchClip from "../assets/trench.mp4";
import trenchPoster from "../assets/trench-poster.jpg";

/* Every claim here traces back to the project write-ups in /content and to
   src/data/results.js. Nothing is rounded up, and nothing is invented. */

export const PROJECTS = [
  {
    id: "es-ml-trader",
    title: "ES-ML-Trader",
    kind: "Research platform",
    year: "1 year",
    /* No motif: the featured card draws a live synthetic ladder instead. */
    tagline:
      "A machine learning research platform for S&P 500 futures — and the record of it failing to make money.",
    problem:
      "Most trading projects show a rising equity curve and stay quiet about costs. That is the reason most of them are worthless. I built the machinery to find out whether my own predictions survived the spread, and I fixed the pass mark in writing before I looked.",
    stack: [
      "Python 3.11",
      "PyTorch",
      "NumPy",
      "Databento MBO",
      "Walk-forward CV",
    ],
    links: [{ label: "Source on GitHub", href: GITHUB }],
    highlights: [
      { value: "20.6 GB", label: "market-by-order data" },
      { value: "47,958,325", label: "bars built" },
      { value: "8 / 8", label: "negative after costs" },
    ],
  },
  {
    id: "voxel-trench-warfare",
    title: "Voxel Trench Warfare",
    kind: "Game engine",
    year: "Python · Panda3D",
    motif: "voxel",
    media: {
      src: trenchClip,
      poster: trenchPoster,
      alt: "Nine seconds of Voxel Trench Warfare: a first-person view along a trench line, engine instrumentation running in the corners.",
    },
    tagline:
      "A first-person trench-warfare shooter with fully destructible voxel terrain, written in Python over Panda3D.",
    problem:
      "Shells collapse trench walls and the soil settles realistically. The whole simulation is deterministic and hash-verified, so any round can be replayed exactly — which is what makes a bug in a physics system reproducible instead of anecdotal.",
    stack: ["Python", "Panda3D", "Voxel terrain", "Deterministic sim"],
    links: [
      {
        label: "Source on GitHub",
        href: "https://github.com/LordJord78/Voxel-Trench-Warfare",
      },
    ],
    details: [
      "Ballistics model projectile drag.",
      "Recoil is split into an aiming layer and a cosmetic layer, with a test that asserts the cosmetic layer can never move a bullet.",
      "Suppression reaches differently depending on the terrain between shooter and target.",
      "Chunk rebuilds are prioritised into four bands by visibility and distance, so the world keeps up under sustained shelling.",
    ],
  },
  {
    id: "gamma-regime-tool",
    title: "Gamma regime tool",
    kind: "Options analytics",
    year: "Python",
    motif: "gamma",
    tagline:
      "Dealer gamma exposure across the options chain, with automatic detection of the gamma flip point.",
    problem:
      "Above the flip, dealer hedging damps volatility; below it, the same hedging amplifies it. The tool computes exposure across the chain, finds where the sign changes, and classifies the current regime from it.",
    stack: ["Python", "Options chain", "Dealer positioning"],
    links: [],
    details: [
      "Gamma is computed in-house from Black-Scholes rather than taken from the vendor's greeks.",
      "Exposure is aggregated over the three nearest expirations and strikes within 6% of spot; implied volatility outside 1–300% is discarded rather than flagged, which is what the first version got wrong — it labelled the bad quotes and still let them into the sum.",
      "Every morning it writes down a falsifiable prediction — mean-reverting, trend-persistent, or no edge — and scores it against the session's realised efficiency ratio, with a separation test once there are enough sessions to run one.",
      "The regime thresholds ship uncalibrated, and say so in the source: they are placeholder numbers until twenty-odd scored sessions say where the real boundaries are.",
      "It will not predict direction. Gamma exposure measures whether moves dampen or extend, and the dealer sign convention is an assumption about customer flow — no public data says who holds which side.",
    ],
  },
];
