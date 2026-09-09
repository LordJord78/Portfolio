# ES-ML-Trader

**A machine learning research platform for S&P 500 futures — and the record of it failing to make money.**

---

## The short version

I spent a year building a system to predict short-term price moves in E-mini
S&P 500 futures from full order-book data, then measured whether the
predictions were worth trading on.

They weren't. Every one of the eight measurements came back negative once
transaction costs were subtracted.

I'm leading with that because the alternative — showing a rising equity curve
and staying quiet about the costs — is what most trading projects do, and it's
the reason most of them are worthless. The interesting part of this project is
the machinery I built to find out I was wrong, and the fact that I set the pass
mark before I looked.

---

## What it actually does

The raw material is 20.6 GB of Databento GLBX.MDP3 market-by-order data: every
individual order added, cancelled, modified, and filled on the ES contract,
timestamped to the nanosecond. That's not a price chart. It's the full state of
the order book, message by message.

From that, the system:

1. **Rebuilds the order book** — replays every message to reconstruct what the
   book looked like at any instant.
2. **Compresses it into bars** — turns a firehose of millions of messages into
   a manageable sequence of observations, 47,958,325 of them.
3. **Describes each moment in 40 numbers** — order-flow imbalance, book shape,
   volatility regime. No raw prices; prices drift and break across contract
   rolls, so everything is a return, a tick-relative distance, or a normalised
   depth.
4. **Asks four questions at once** — will price move enough to be worth trading
   over the next 1, 4, 20, or 120 bars? Each answer is LONG, SHORT, or
   NO-TRADE.
5. **Calibrates its confidence** — a model that says "70%" should be right about
   70% of the time. Vector scaling, fitted separately at each horizon.
6. **Measures whether any of it pays** — after the broker's fee and the cost of
   crossing the spread.

Step 6 is where it stops.

---

## The result

At a threshold of 0.50, on the evaluation region, across five walk-forward
folds:

| Horizon | Side | Trades | Gross P&L | After known costs |
|--------:|------|-------:|----------:|------------------:|
| 1   | long  | 8   | +$168.75    | **−$171.08**   |
| 1   | short | 20  | +$162.50    | **−$852.70**   |
| 4   | long  | 52  | +$1,537.50  | **−$1,012.02** |
| 4   | short | 37  | −$300.00    | **−$2,013.12** |
| 20  | long  | 98  | +$1,875.00  | **−$1,426.98** |
| 20  | short | 33  | −$2,212.50  | **−$3,502.58** |
| 120 | long  | 116 | −$1,362.50  | **−$4,143.16** |
| 120 | short | 119 | +$1,318.75  | **−$1,560.44** |

Five of the eight are gross-positive. All eight are negative after costs. At the
one-bar horizon the model finds a real edge of about $169 and then pays $294 to
cross the spread collecting it.

Two things make this a finding rather than a disappointment:

**The threshold was pre-registered.** 0.50, fixed in writing before any economic
result existed, identical at every horizon, never swept or optimised. Had I
chosen it after seeing the output, the number would mean nothing.

**The figure is an upper bound, not an estimate.** It subtracts only the
broker's published charge and the observed spread. Routing fees, slippage,
queue position, market impact, and adverse selection are all excluded — and
excluded is not the same as zero. Realised P&L can only be this number or
worse. I wrote that asymmetry down in advance too: a positive result would have
proved nothing, while a negative one is strong evidence against.

The trade counts are small — 8 to 119 per cell out of roughly 2.3 million
candidate rows per fold — so these are noisy estimates. That's a limitation of
the measurement, not a reason to discount its direction.

---

## The parts I'm actually proud of

### The book reconstruction is provably exact

Rebuilding an order book from message data is easy to do approximately and hard
to do correctly. My first validation run came back at 98.78% agreement against
the exchange's own ten-level feed, and I spent two weeks convinced the missing
1.22% was implied liquidity from calendar spreads leaking into the book.

It wasn't. The gap was an artefact of my comparison harness — I was comparing
mid-update states against settled ones. Corrected, the reconstruction matches
exactly: price, size, and per-level order count, all ten levels.

Two weeks to discover my code was right and my test was wrong. The lesson stuck.

### The holdout is enforced by the code, not by my willpower

2026 data is sealed. Not "I've decided not to look at it" — every data-access
entry point in the codebase refuses a path resolving into the holdout, and the
config loader refuses to start if the data root points there. There's no
environment-variable bypass. Unlocking it requires a versioned edit to a
committed config file.

Before this was implemented, the guard function existed and was called by
nothing. Declared discipline isn't discipline.

### No future information, verified

Every bar carries the guarantee that no information from after its own
timestamp went into it. Zero violations across all 47,958,325 bars. Market data
arrives with two clocks — when the exchange stamped an event and when a
participant could actually have seen it — and using the wrong one is the most
common way a backtest quietly cheats.

### Every decision is on the record

Six architecture decision records. A model specification where each choice is a
numbered, dated act with explicit scope, and where satisfying a precondition
never automatically grants permission to proceed. When I found that duplicate
fill messages were inflating a feature's event count, I wrote a test
characterising the bug and deliberately *didn't* fix it — the fix would have
silently changed every cached bar, and that deserved its own decision rather
than a quiet patch.

---

## What isn't done

- **No live trading.** Not implemented, off by default, and gated behind a
  chain that ends in manual approval.
- **Book validation is narrow.** Reconstruction is exact, but only one session
  of ten-level reference data exists to check against, and it's a quiet January
  day. Correctness is established; behaviour under stress isn't.
- **No latency model.** Only observability.
- **The 2026 holdout has never been opened.** It gets exactly one use, at the
  end, and only if something earns it.

---

## Stack

Python 3.11, PyTorch, NumPy. Databento GLBX.MDP3 MBO data. Purged walk-forward
cross-validation with embargo, five folds. Shared trunk with four per-horizon
heads. Structured logging, typed throughout, regression tests covering data
invariants rather than just functions.
