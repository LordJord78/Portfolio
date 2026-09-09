import { useEffect, useRef, useState } from "react";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./OrderBook.css";

/* ------------------------------------------------------------------ *
 * A live limit-order-book ladder for the ES-ML-Trader card.
 *
 * The book is SYNTHETIC — resting size mean-reverts around a shaped
 * profile, aggressive trades eat the touch, blocks arrive and decay —
 * and the card says so. Nothing here is a replay of a real session.
 *
 * Rendering: React draws the skeleton once. A single rAF loop advances
 * the simulation on a fixed cadence and eases every displayed value
 * toward its target each frame, writing straight to the DOM: bar widths
 * as `transform: scaleX`, text only when the rounded value changes, and
 * event flashes as a Web Animations opacity fade. Rows are rank-anchored
 * (best ask always sits just above the spread), so the DOM order never
 * changes and nothing is ever re-rendered by React while it runs.
 * ------------------------------------------------------------------ */

const TICK = 0.25;
const START = 6512.0; /* opening best bid — a plausible ES handle, arbitrary */
const STEP_MS = 115; /* one book event per step, with jitter */

const fmtPrice = (p) =>
  p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Resting size by distance from the touch: thin at the top of book, a
   hump a few ticks back, then a slow ramp — the shape of a normal ES book. */
const base = (i) => 48 + 240 * Math.exp(-Math.pow((i - 2.6) / 2.4, 2)) + 20 * i;

const fresh = (i) => base(i) * (0.72 + Math.random() * 0.56);

function createBook(levels) {
  const side = () => Array.from({ length: levels }, (_, i) => fresh(i));
  return {
    levels,
    mid: START + TICK / 2, /* best bid + half a tick, so both sides sit on the grid */
    bids: side(),
    asks: side(),
    last: null, /* { price, size, buy } of the most recent print */
    events: [], /* [{ side, i, kind }] raised this step, for flashes */
  };
}

/* One step of the synthetic market. Mutates targets only; the display
   eases toward them separately, so a step never causes a visible jump. */
function step(book) {
  const { levels, bids, asks } = book;
  book.events.length = 0;

  /* Every level drifts and mean-reverts around its base profile. */
  for (let i = 0; i < levels; i++) {
    const b = base(i);
    bids[i] = Math.max(1, bids[i] + (b - bids[i]) * 0.06 + (Math.random() - 0.5) * b * 0.26);
    asks[i] = Math.max(1, asks[i] + (b - asks[i]) * 0.06 + (Math.random() - 0.5) * b * 0.26);
  }

  const r = Math.random();

  if (r < 0.15) {
    /* An aggressive order crosses the spread and prints. */
    const buy = Math.random() < 0.5;
    const hit = buy ? asks : bids;
    const rest = buy ? bids : asks;
    const avail = Math.max(1, Math.round(hit[0]));
    const size = Math.max(1, Math.min(avail, Math.round(avail * (0.22 + Math.random() * 0.95))));
    const price = buy ? book.mid + TICK / 2 : book.mid - TICK / 2;

    book.last = { price, size, buy };
    hit[0] -= size;
    book.events.push({ side: buy ? "ask" : "bid", i: 0, kind: "trade" });

    if (hit[0] < 1) {
      /* The touch is gone: the book shifts a tick and a thin new level
         appears on the passive side at the price that just traded. */
      hit.shift();
      hit.push(fresh(levels - 1));
      rest.pop();
      rest.unshift(3 + Math.random() * 16);
      book.mid += buy ? TICK : -TICK;
      book.events.push({ side: "mid", kind: buy ? "up" : "down" });
    }
  } else if (r < 0.19) {
    /* A block arrives a few levels back and will decay on its own. */
    const askSide = Math.random() < 0.5;
    const arr = askSide ? asks : bids;
    const i = 1 + Math.floor(Math.random() * (levels - 1));
    arr[i] += base(i) * (1.1 + Math.random() * 1.4);
    book.events.push({ side: askSide ? "ask" : "bid", i, kind: "add" });
  } else if (r < 0.31) {
    /* A cancel pulls most of a level. */
    const askSide = Math.random() < 0.5;
    const arr = askSide ? asks : bids;
    const i = Math.floor(Math.random() * levels);
    arr[i] = Math.max(1, arr[i] * (0.25 + Math.random() * 0.4));
    book.events.push({ side: askSide ? "ask" : "bid", i, kind: "pull" });
  }
}

function Row({ side, i }) {
  return (
    <div className={`ob__row ob__row--${side}`} data-side={side} data-i={i}>
      <span className="ob__bar ob__bar--total" aria-hidden="true" />
      <span className="ob__bar ob__bar--size" aria-hidden="true" />
      <span className="ob__flash" aria-hidden="true" />
      <span className="ob__cell ob__price">0</span>
      <span className="ob__cell ob__size">0</span>
      <span className="ob__cell ob__total">0</span>
    </div>
  );
}

export default function OrderBook() {
  const reduced = useReducedMotion();
  const root = useRef(null);

  /* Fewer levels on a phone so the ladder stays a ladder, not a wall. */
  const [levels] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches ? 6 : 7
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const book = createBook(levels);
    /* Settle the book so the first frame already looks lived-in. */
    for (let n = 0; n < 24; n++) step(book);
    book.events.length = 0;

    /* ---- collect the DOM once ---- */

    const rows = { ask: [], bid: [] };
    for (const node of el.querySelectorAll(".ob__row")) {
      const r = {
        el: node,
        total: node.querySelector(".ob__bar--total"),
        size: node.querySelector(".ob__bar--size"),
        flash: node.querySelector(".ob__flash"),
        price: node.querySelector(".ob__price"),
        sizeText: node.querySelector(".ob__size"),
        totalText: node.querySelector(".ob__total"),
        /* what is currently written, so writes only happen on change */
        wPrice: "",
        wSize: -1,
        wTotal: -1,
        wSizeX: -1,
        wTotalX: -1,
      };
      rows[node.dataset.side][Number(node.dataset.i)] = r;
    }

    const lastPrice = el.querySelector(".ob__last-price");
    const lastSize = el.querySelector(".ob__last-size");
    const lastMark = el.querySelector(".ob__last");
    const midFlash = el.querySelector(".ob__flash--mid");
    const imbText = el.querySelector(".ob__imb-v");
    const imbFill = el.querySelector(".ob__imb-fill");
    const imbWrap = el.querySelector(".ob__imb");

    /* ---- display state, eased toward the book each frame ---- */

    const shown = {
      ask: book.asks.slice(),
      bid: book.bids.slice(),
    };
    let sizeMax = 1;
    let totalMax = 1;
    let imb = 0.5; /* eased share of the top-of-book resting on the bid */
    let writtenImb = -1;
    let writtenLast = "";
    let writtenMid = NaN;
    const IMB_DEPTH = Math.min(4, levels);

    const priceAt = (side, i) =>
      side === "ask" ? book.mid + TICK / 2 + i * TICK : book.mid - TICK / 2 - i * TICK;

    const writeText = (node, text) => {
      if (node.textContent !== text) node.textContent = text;
    };

    const paint = (dt) => {
      /* Time-constant easing: ~150 ms for a level, slower for the scales
         so the whole ladder does not breathe every time one level moves. */
      const k = 1 - Math.exp(-dt / 150);
      const ks = 1 - Math.exp(-dt / 520);

      let maxSize = 1;
      let maxTotal = 1;
      const totals = { ask: [], bid: [] };

      for (const side of ["ask", "bid"]) {
        const target = side === "ask" ? book.asks : book.bids;
        const cur = shown[side];
        let run = 0;
        for (let i = 0; i < levels; i++) {
          cur[i] += (target[i] - cur[i]) * k;
          run += cur[i];
          totals[side][i] = run;
          if (cur[i] > maxSize) maxSize = cur[i];
        }
        if (run > maxTotal) maxTotal = run;
      }

      sizeMax += (maxSize * 1.08 - sizeMax) * ks;
      totalMax += (maxTotal * 1.02 - totalMax) * ks;

      /* Top-of-book imbalance: the share of resting size on the bid across
         the first few levels — the crudest order-flow signal there is. */
      const bidTop = totals.bid[IMB_DEPTH - 1];
      const askTop = totals.ask[IMB_DEPTH - 1];
      imb += (bidTop / (bidTop + askTop) - imb) * ks;
      const imbPct = Math.round(imb * 100);
      if (imbPct !== writtenImb) {
        writtenImb = imbPct;
        writeText(imbText, `${imbPct}%`);
        imbFill.style.transform = `scaleX(${imb.toFixed(4)})`;
        imbWrap.dataset.lean = imbPct > 55 ? "bid" : imbPct < 45 ? "ask" : "flat";
      }

      for (const side of ["ask", "bid"]) {
        const cur = shown[side];
        for (let i = 0; i < levels; i++) {
          const r = rows[side][i];
          if (!r) continue;

          const sx = Math.min(1, cur[i] / sizeMax);
          if (Math.abs(sx - r.wSizeX) > 0.002) {
            r.wSizeX = sx;
            r.size.style.transform = `scaleX(${sx.toFixed(4)})`;
          }

          const tx = Math.min(1, totals[side][i] / totalMax);
          if (Math.abs(tx - r.wTotalX) > 0.002) {
            r.wTotalX = tx;
            r.total.style.transform = `scaleX(${tx.toFixed(4)})`;
          }

          const s = Math.round(cur[i]);
          if (s !== r.wSize) {
            r.wSize = s;
            writeText(r.sizeText, String(s));
          }

          const t = Math.round(totals[side][i]);
          if (t !== r.wTotal) {
            r.wTotal = t;
            writeText(r.totalText, t.toLocaleString("en-US"));
          }
        }
      }

      if (book.mid !== writtenMid) {
        writtenMid = book.mid;
        for (const side of ["ask", "bid"]) {
          for (let i = 0; i < levels; i++) {
            const r = rows[side][i];
            if (!r) continue;
            const p = fmtPrice(priceAt(side, i));
            if (p !== r.wPrice) {
              r.wPrice = p;
              writeText(r.price, p);
            }
          }
        }
      }

      if (book.last) {
        const key = `${book.last.price}|${book.last.size}|${book.last.buy}`;
        if (key !== writtenLast) {
          writtenLast = key;
          writeText(lastPrice, fmtPrice(book.last.price));
          writeText(lastSize, `${book.last.size}`);
          lastMark.dataset.side = book.last.buy ? "buy" : "sell";
          midFlash.dataset.side = lastMark.dataset.side;
        }
      }
    };

    const flash = (node, strength) => {
      if (!node || reduced) return;
      node.animate(
        [{ opacity: strength }, { opacity: 0 }],
        { duration: 640, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
      );
    };

    const raiseEvents = () => {
      for (const ev of book.events) {
        if (ev.side === "mid") {
          flash(midFlash, 0.28);
          continue;
        }
        const r = rows[ev.side][ev.i];
        if (!r) continue;
        flash(r.flash, ev.kind === "trade" ? 0.55 : ev.kind === "add" ? 0.34 : 0.22);
      }
      book.events.length = 0;
    };

    /* First frame: everything written, nothing eased. */
    paint(1e6);

    if (reduced) return; /* a static, honest snapshot */

    /* ---- loop ---- */

    let raf = 0;
    let last = 0;
    let acc = 0;
    let nextStep = STEP_MS;
    let visible = document.visibilityState !== "hidden";
    let onScreen = true;

    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - (last || now));
      last = now;

      acc += dt;
      while (acc >= nextStep) {
        acc -= nextStep;
        nextStep = STEP_MS * (0.6 + Math.random() * 0.9);
        step(book);
        raiseEvents();
      }

      paint(dt);
    };

    const running = () => visible && onScreen;

    const sync = () => {
      if (running() && !raf) {
        last = 0;
        raf = requestAnimationFrame(loop);
      } else if (!running() && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const onVisibility = () => {
      visible = document.visibilityState !== "hidden";
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    io.observe(el);

    sync();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [levels, reduced]);

  const asks = Array.from({ length: levels }, (_, i) => levels - 1 - i);
  const bids = Array.from({ length: levels }, (_, i) => i);

  return (
    <div
      ref={root}
      className="ob"
      role="img"
      aria-label="Illustrative limit order book ladder: asks above the spread, bids below, resting size drawn as depth bars. Synthetic data, not a live market."
    >
      <div className="ob__head">
        <span className="ob__sym">
          <span className="ob__live" />
          ES · synthetic book
        </span>
        <span className="ob__legend">
          <span>
            <i className="ob__key ob__key--ask" />
            Ask
          </span>
          <span>
            <i className="ob__key ob__key--bid" />
            Bid
          </span>
        </span>
      </div>

      <div className="ob__cols">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>

      <div className="ob__side ob__side--ask">
        {asks.map((i) => (
          <Row key={`a${i}`} side="ask" i={i} />
        ))}
      </div>

      <div className="ob__mid">
        <span className="ob__flash ob__flash--mid" data-side="buy" aria-hidden="true" />
        <span className="ob__last" data-side="buy">
          <span className="ob__last-arrow" aria-hidden="true" />
          <span className="ob__last-price">{fmtPrice(START)}</span>
          <span className="ob__last-size">0</span>
        </span>
        <span className="ob__imb">
          <span className="ob__imb-label">
            bid <span className="ob__imb-v">50%</span>
          </span>
          <span className="ob__imb-track" aria-hidden="true">
            <span className="ob__imb-fill" />
          </span>
        </span>
      </div>

      <div className="ob__side ob__side--bid">
        {bids.map((i) => (
          <Row key={`b${i}`} side="bid" i={i} />
        ))}
      </div>
    </div>
  );
}
