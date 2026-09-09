/* There is no employment history in this repository, so this section does
   not claim any. What it does have is the documented order in which the
   ES-ML-Trader year happened — every entry below is taken from
   content/es-ml-trader-project-page.md. */

export const STANDING = [
  { k: "Studying", v: "Mathematics, Solano Community College" },
  { k: "Transferring for", v: "Financial mathematics and statistics" },
  { k: "Working on", v: "Market microstructure and machine learning research" },
  { k: "Writing in", v: "Python, and JavaScript when something needs a face" },
];

export const ARC = [
  {
    id: "validate",
    mark: "98.78%",
    title: "The first validation came back just short",
    body: "The rebuilt order book agreed with the exchange's own ten-level feed almost everywhere. Almost is the interesting part.",
  },
  {
    id: "suspect",
    mark: "2 weeks",
    title: "Two weeks on the wrong suspect",
    body: "I was convinced the missing 1.22% was implied liquidity leaking in from calendar spreads, and went looking for it in the wrong place.",
  },
  {
    id: "harness",
    mark: "exact",
    title: "The test was wrong, not the code",
    body: "The gap was my comparison harness measuring mid-update states against settled ones. Corrected, the reconstruction matches exactly — price, size and per-level order count, across all ten levels.",
  },
  {
    id: "guard",
    mark: "sealed",
    title: "A guard that guarded nothing",
    body: "The holdout guard existed and was called by nothing. Sealing 2026 for real meant every data-access path refusing it, and a config loader that won't start if the data root points there.",
  },
  {
    id: "bars",
    mark: "0",
    title: "47,958,325 bars, no future information",
    body: "Every bar carries the guarantee that nothing after its own timestamp went into it. Zero violations across the whole set.",
  },
  {
    id: "cost",
    mark: "2026-08-24",
    title: "Then I charged it for trading",
    body: "Five of the eight cells are gross-positive. All eight are negative once the broker's fee and the spread come out. That is the run this site reports.",
  },
];
