/* Source of truth: content/es-ml-trader-project-page.md and
   src/data/results.js. Figures are quoted, not estimated. */

export const METRICS = [
  {
    value: 20.6,
    suffix: " GB",
    decimals: 1,
    label: "Market-by-order data",
    note: "Databento GLBX.MDP3, nanosecond stamped",
  },
  {
    value: 47958325,
    label: "Bars reconstructed",
    note: "Compressed from every book message",
  },
  {
    value: 40,
    label: "Features per bar",
    note: "Returns, depth and regime — no raw prices",
  },
  {
    value: 0,
    label: "Lookahead violations",
    note: "Verified across all 47,958,325 bars",
  },
];

export const PIPELINE = [
  {
    step: "01",
    title: "Rebuild the book",
    body: "Replay every add, cancel, modify and fill to reconstruct the exact state of the order book at any instant.",
  },
  {
    step: "02",
    title: "Compress to bars",
    body: "Turn a firehose of millions of messages into 47,958,325 ordered observations.",
  },
  {
    step: "03",
    title: "Describe the moment",
    body: "40 features: order-flow imbalance, book shape, volatility regime. Everything is a return, a tick-relative distance or a normalised depth — never a raw price.",
  },
  {
    step: "04",
    title: "Ask four questions",
    body: "Will price move enough to be worth trading over the next 1, 4, 20 or 120 bars? Each answer is long, short, or no trade.",
  },
  {
    step: "05",
    title: "Calibrate confidence",
    body: "A model that says 70% should be right about 70% of the time. Vector scaling, fitted separately at each horizon.",
  },
  {
    step: "06",
    title: "Charge it for trading",
    body: "Subtract the broker's fee and the cost of crossing the spread, then see what is left. This is where it stops.",
  },
];

export const NOTES = [
  {
    id: "exact",
    title: "The book reconstruction is provably exact",
    lede: "98.78% agreement, two weeks of suspicion, and a broken test.",
    body: [
      "Rebuilding an order book from message data is easy to do approximately and hard to do correctly. My first validation run came back at 98.78% agreement against the exchange's own ten-level feed, and I spent two weeks convinced the missing 1.22% was implied liquidity leaking in from calendar spreads.",
      "It wasn't. The gap was an artefact of my comparison harness — I was measuring mid-update states against settled ones. Corrected, the reconstruction matches exactly: price, size and per-level order count, across all ten levels. Two weeks to discover my code was right and my test was wrong.",
    ],
  },
  {
    id: "holdout",
    title: "The holdout is enforced by code, not willpower",
    lede: "2026 data is sealed at the data-access layer.",
    body: [
      "Not “I've decided not to look at it” — every data-access entry point refuses a path resolving into the holdout, and the config loader refuses to start if the data root points there. There is no environment-variable bypass; unlocking it takes a versioned edit to a committed file.",
      "Before this was implemented, the guard function existed and was called by nothing. That is worth saying out loud: declared discipline isn't discipline.",
    ],
  },
  {
    id: "leakage",
    title: "No future information, verified",
    lede: "Zero violations across all 47,958,325 bars.",
    body: [
      "Every bar carries the guarantee that no information from after its own timestamp went into it. Market data arrives with two clocks — when the exchange stamped an event, and when a participant could actually have seen it — and using the wrong one is the most common way a backtest quietly cheats.",
    ],
  },
  {
    id: "record",
    title: "Every decision is on the record",
    lede: "Six architecture decision records, and one bug deliberately left alone.",
    body: [
      "A model specification where each choice is a numbered, dated act with explicit scope, and where satisfying a precondition never automatically grants permission to proceed.",
      "When I found that duplicate fill messages were inflating a feature's event count, I wrote a test characterising the bug and deliberately didn't fix it — the fix would have silently changed every cached bar, and that deserved its own decision rather than a quiet patch.",
    ],
  },
];

export const LIMITS = [
  {
    title: "No live trading",
    body: "Not implemented, off by default, and gated behind a chain that ends in manual approval.",
  },
  {
    title: "Book validation is narrow",
    body: "Reconstruction is exact, but only one session of ten-level reference data exists to check against — and it is a quiet January day. Correctness is established; behaviour under stress isn't.",
  },
  {
    title: "No latency model",
    body: "Only observability.",
  },
  {
    title: "The 2026 holdout is unopened",
    body: "It gets exactly one use, at the end, and only if something earns it.",
  },
];

export const METHOD = [
  ["Data", "Databento GLBX.MDP3 market-by-order, ES contract"],
  ["Validation", "Purged walk-forward cross-validation with embargo, five folds"],
  ["Model", "Shared trunk with four per-horizon heads, PyTorch"],
  ["Calibration", "Vector scaling, fitted per horizon"],
  ["Threshold", "0.50 — pre-registered in writing, never swept"],
  ["Costs", "Broker fee plus observed spread; slippage and impact excluded"],
];
