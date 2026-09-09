import { useState } from "react";
import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import Counter from "../ui/Counter.jsx";
import ResultsTable from "./ResultsTable.jsx";
import { LIMITS, METHOD, METRICS, NOTES, PIPELINE } from "../../data/research.js";
import "./Research.css";

function Metrics() {
  return (
    <Reveal as="ul" className="rs__metrics">
      {METRICS.map((m, i) => (
        <li key={m.label} style={{ "--d": `${i * 70}ms` }}>
          <p className="rs__metric-v">
            <Counter value={m.value} decimals={m.decimals ?? 0} suffix={m.suffix ?? ""} />
          </p>
          <p className="rs__metric-l">{m.label}</p>
          <p className="rs__metric-n">{m.note}</p>
        </li>
      ))}
    </Reveal>
  );
}

function Pipeline() {
  return (
    <div className="rs__block">
      <Reveal as="h3" className="rs__h">
        The pipeline
        <span className="rs__h-note">raw messages to a decision, in six stages</span>
      </Reveal>

      <ol className="rs__pipe">
        {PIPELINE.map((p, i) => (
          <Reveal as="li" key={p.step} delay={i * 60} className="rs__stage">
            <span className="rs__stage-n u-mono">{p.step}</span>
            <h4 className="rs__stage-t">{p.title}</h4>
            <p className="rs__stage-b">{p.body}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

function Results() {
  return (
    <div className="rs__block">
      <Reveal as="h3" className="rs__h">
        The result
        <span className="rs__h-note">threshold 0.50, five walk-forward folds</span>
      </Reveal>

      <Reveal className="rs__verdict">
        <p className="rs__verdict-lead">
          Five of the eight cells are gross-positive. <strong>All eight are
          negative after costs.</strong> At the one-bar horizon the model finds a
          real edge of about $169 and then pays $294 to cross the spread
          collecting it.
        </p>
      </Reveal>

      <Reveal delay={80}>
        <ResultsTable />
      </Reveal>

      <div className="rs__pair">
        <Reveal className="rs__claim">
          <h4 className="rs__claim-t">The threshold was pre-registered</h4>
          <p className="rs__claim-b">
            0.50, fixed in writing before any economic result existed, identical
            at every horizon, never swept or optimised. Had I chosen it after
            seeing the output, the number would mean nothing.
          </p>
        </Reveal>

        <Reveal className="rs__claim" delay={80}>
          <h4 className="rs__claim-t">The figure is an upper bound</h4>
          <p className="rs__claim-b">
            It subtracts only the broker’s published charge and the observed
            spread. Routing, slippage, queue position and market impact are
            excluded — and excluded is not the same as zero. Realised P&amp;L can
            only be this number or worse.
          </p>
        </Reveal>
      </div>

      <Reveal as="p" className="rs__fine">
        The trade counts are small — 8 to 119 per cell out of roughly 2.3 million
        candidate rows per fold — so these are noisy estimates. That is a
        limitation of the measurement, not a reason to discount its direction.
      </Reveal>
    </div>
  );
}

function Notes() {
  const [open, setOpen] = useState(() => new Set([NOTES[0].id]));

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="rs__block">
      <Reveal as="h3" className="rs__h">
        What makes it trustworthy
        <span className="rs__h-note">the parts worth defending</span>
      </Reveal>

      <div className="rs__notes">
        {NOTES.map((n, i) => {
          const isOpen = open.has(n.id);
          return (
            <Reveal key={n.id} delay={i * 50}>
              <article className={`rs__note ${isOpen ? "is-open" : ""}`}>
                <h4 className="rs__note-h">
                  <button
                    type="button"
                    className="rs__note-btn"
                    aria-expanded={isOpen}
                    aria-controls={`note-${n.id}`}
                    onClick={() => toggle(n.id)}
                  >
                    <span className="rs__note-title">
                      {n.title}
                      <span className="rs__note-lede">{n.lede}</span>
                    </span>
                    <span className="rs__note-ic" aria-hidden="true" />
                  </button>
                </h4>

                {isOpen ? (
                  <div id={`note-${n.id}`} className="rs__note-body">
                    {n.body.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                  </div>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function Spec() {
  return (
    <div className="rs__block rs__spec-wrap">
      <Reveal className="rs__spec">
        <h3 className="rs__h">Method</h3>
        <dl className="rs__dl">
          {METHOD.map(([k, v]) => (
            <div key={k} className="rs__dl-row">
              <dt className="u-mono">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal className="rs__limits" delay={90}>
        <h3 className="rs__h">
          What isn’t done
          <span className="rs__h-note">stated, not buried</span>
        </h3>
        <ul className="rs__limit-list">
          {LIMITS.map((l) => (
            <li key={l.title}>
              <span className="rs__limit-t">{l.title}</span>
              <span className="rs__limit-b">{l.body}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}

export default function Research() {
  return (
    <Section
      id="research"
      eyebrow="Research"
      title="A year of machine learning on the order book, and the record of it failing to pay"
      lede="Most trading projects show a rising equity curve and stay quiet about costs. This one leads with the measurement that killed it — because the machinery built to find that out is the part that was worth building."
      aside="ES-ML-Trader"
    >
      <Metrics />
      <Pipeline />
      <Results />
      <Notes />
      <Spec />
    </Section>
  );
}
