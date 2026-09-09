/* ------------------------------------------------------------------ *
 * Dealer gamma exposure by strike — the figure the gamma regime tool
 * produces each morning.
 *
 * The maths here mirrors the tool one-for-one: Black-Scholes gamma
 * computed in-house rather than trusting a vendor's greeks, GEX summed
 * per strike as gamma x OI x 100 x S^2 x 1%, the flip located as the
 * zero crossing of net GEX across hypothetical spot levels, and the
 * walls as the strikes where gamma-weighted open interest concentrates
 * on each side.
 *
 * The CHAIN is synthetic — a shaped, deterministic stand-in for a real
 * option chain, with no random component, so the figure is identical on
 * every render — and the card says so on screen. The tool itself reads a
 * live chain; this is the shape of its output, not a capture of one.
 * ------------------------------------------------------------------ */

const RISK_FREE = 0.045; /* matches RISK_FREE in the tool */
const SQRT_2PI = Math.sqrt(2 * Math.PI);
const npdf = (x) => Math.exp(-0.5 * x * x) / SQRT_2PI;

/* Gamma per $1 move. Guarded the same way the tool guards it: a zero or
   negative T or sigma yields zero rather than an exploding denominator. */
export function bsGamma(S, K, T, sigma, r = RISK_FREE) {
  if (!(T > 0) || !(sigma > 0)) return 0;
  const v = sigma * Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / v;
  const g = npdf(d1) / (S * v);
  return Number.isFinite(g) ? g : 0;
}

export const SPOT = 600;
const STRIKE_STEP = 2;
const SPAN = 0.06; /* +/- 6% of spot, as STRIKE_PCT in the tool */

const STRIKES = [];
for (let k = SPOT * (1 - SPAN); k <= SPOT * (1 + SPAN) + 1e-9; k += STRIKE_STEP) {
  STRIKES.push(Math.round(k));
}

/* Two near expirations, the nearer one carrying more open interest. */
const EXPIRIES = [
  { T: 4 / 365, w: 1 },
  { T: 11 / 365, w: 0.62 },
];

/* A downside-skewed vol surface: puts are bid, the smile turns up at both
   wings. Deterministic in the strike. */
const iv = (K) => {
  const m = (K - SPOT) / SPOT;
  return 0.118 + 0.42 * Math.max(0, -m) + 3.2 * m * m;
};

const hump = (K, c, w) => Math.exp(-Math.pow((K - c) / w, 2));

/* Customers are long calls above and long puts below, concentrated where
   the round strikes are. Under the tool's sign convention that leaves the
   dealer short those calls and puts. */
const callOI = (K) => 17000 * hump(K, 611, 10) + 6000 * hump(K, 602, 15) + 1100;
const putOI = (K) => 14000 * hump(K, 583, 9) + 3000 * hump(K, 594, 12) + 900;

const CONTRACTS = [];
for (const { T, w } of EXPIRIES) {
  for (const K of STRIKES) {
    CONTRACTS.push({ K, T, sigma: iv(K), oi: callOI(K) * w, sign: 1 });
    CONTRACTS.push({ K, T, sigma: iv(K), oi: putOI(K) * w, sign: -1 });
  }
}

const gexOf = (c, S) =>
  bsGamma(S, c.K, c.T, c.sigma) * c.oi * 100 * S * S * 0.01 * c.sign;

/* Net GEX per strike: calls and puts at the same strike offset, which is
   why the most negative strike need not be the put wall. */
export function gexByStrike(S = SPOT) {
  const m = new Map();
  for (const c of CONTRACTS) m.set(c.K, (m.get(c.K) ?? 0) + gexOf(c, S));
  return [...m.entries()].sort((a, b) => a[0] - b[0]);
}

export const netGex = (S = SPOT) =>
  CONTRACTS.reduce((sum, c) => sum + gexOf(c, S), 0);

/* Zero crossing of net GEX across hypothetical spots, nearest to spot.
   One pass, the vectorised form the tool uses instead of recomputing the
   whole chain at every grid point. */
export function gammaFlip(steps = 121) {
  const lo = SPOT * (1 - SPAN);
  const hi = SPOT * (1 + SPAN);
  const xs = [];
  const ys = [];
  for (let i = 0; i < steps; i++) {
    const S = lo + (i / (steps - 1)) * (hi - lo);
    xs.push(S);
    ys.push(netGex(S));
  }
  const crossings = [];
  for (let i = 0; i < steps - 1; i++) {
    if (Math.sign(ys[i]) !== Math.sign(ys[i + 1])) {
      crossings.push(xs[i] - ys[i] * ((xs[i + 1] - xs[i]) / (ys[i + 1] - ys[i])));
    }
  }
  if (!crossings.length) return null;
  return crossings.reduce((a, b) =>
    Math.abs(a - SPOT) <= Math.abs(b - SPOT) ? a : b
  );
}

/* The strikes where gamma-weighted open interest piles up on each side. */
export function walls(S = SPOT) {
  const call = new Map();
  const put = new Map();
  for (const c of CONTRACTS) {
    const mag = bsGamma(S, c.K, c.T, c.sigma) * c.oi;
    const m = c.sign > 0 ? call : put;
    m.set(c.K, (m.get(c.K) ?? 0) + mag);
  }
  const top = (m) =>
    [...m.entries()].reduce((a, b) => (a[1] >= b[1] ? a : b))[0];
  return { call: top(call), put: top(put) };
}

export const STRIKE_RANGE = [STRIKES[0], STRIKES[STRIKES.length - 1]];
