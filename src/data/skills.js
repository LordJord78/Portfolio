/* Only things this portfolio can actually point at. `from` names the work
   the skill is evidenced by, and is surfaced in the UI on hover/focus. */

const ES = "ES-ML-Trader";
const VTW = "Voxel Trench Warfare";
const GAMMA = "Gamma regime tool";
const SITE = "This site";

export const SKILL_GROUPS = [
  {
    id: "languages",
    label: "Languages",
    hint: "What I write in",
    items: [
      { name: "Python 3.11", from: [ES, VTW, GAMMA] },
      { name: "JavaScript", from: [SITE] },
      { name: "GLSL", from: [SITE] },
      { name: "HTML & CSS", from: [SITE] },
    ],
  },
  {
    id: "ml",
    label: "Machine learning",
    hint: "Models, and the discipline around them",
    items: [
      { name: "PyTorch", from: [ES] },
      { name: "Multi-task heads", from: [ES] },
      { name: "Probability calibration", from: [ES] },
      { name: "Purged walk-forward CV", from: [ES] },
      { name: "Feature engineering", from: [ES] },
    ],
  },
  {
    id: "data",
    label: "Data",
    hint: "Getting 20.6 GB into a shape a model can read",
    items: [
      { name: "NumPy", from: [ES] },
      { name: "Market-by-order data", from: [ES] },
      { name: "Order-book reconstruction", from: [ES] },
      { name: "Bar compression", from: [ES] },
      { name: "Data-invariant tests", from: [ES] },
    ],
  },
  {
    id: "quant",
    label: "Quantitative",
    hint: "Market structure and what trading actually costs",
    items: [
      { name: "Limit order book", from: [ES] },
      { name: "Order-flow imbalance", from: [ES] },
      { name: "Transaction-cost analysis", from: [ES] },
      { name: "Dealer gamma exposure", from: [GAMMA] },
      { name: "Volatility regimes", from: [ES, GAMMA] },
    ],
  },
  {
    id: "sim",
    label: "Simulation & graphics",
    hint: "Worlds that have to stay reproducible",
    items: [
      { name: "Panda3D", from: [VTW] },
      { name: "Voxel terrain", from: [VTW] },
      { name: "Deterministic replay", from: [VTW] },
      { name: "three.js", from: [SITE] },
      { name: "WebGL", from: [SITE] },
    ],
  },
  {
    id: "eng",
    label: "Engineering",
    hint: "How the work is kept honest",
    items: [
      { name: "Git", from: [ES, VTW, SITE] },
      { name: "React", from: [SITE] },
      { name: "Vite", from: [SITE] },
      { name: "Structured logging", from: [ES] },
      { name: "Type annotations", from: [ES] },
      { name: "Decision records", from: [ES] },
    ],
  },
];
