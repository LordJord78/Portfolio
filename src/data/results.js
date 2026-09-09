// Source: research/reports/data/economic_measurement.json
// Run 2026-08-24, branch step-7b-harden-correctness.
// cost_lower_bounded_pnl is an UPPER BOUND on realised net P&L — routing,
// slippage, queue position and market impact are excluded, not zero.
export const RESULTS = [
  { h: 1, side: "long", n: 8, gross: 168.75, net: -171.08 },
  { h: 1, side: "short", n: 20, gross: 162.5, net: -852.7 },
  { h: 4, side: "long", n: 52, gross: 1537.5, net: -1012.02 },
  { h: 4, side: "short", n: 37, gross: -300.0, net: -2013.12 },
  { h: 20, side: "long", n: 98, gross: 1875.0, net: -1426.98 },
  { h: 20, side: "short", n: 33, gross: -2212.5, net: -3502.58 },
  { h: 120, side: "long", n: 116, gross: -1362.5, net: -4143.16 },
  { h: 120, side: "short", n: 119, gross: 1318.75, net: -1560.44 },
];

export const money = (v) =>
  `${v < 0 ? "\u2212" : "+"}$${Math.abs(v).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
