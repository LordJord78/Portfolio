import { useMemo, useState } from "react";
import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import { SKILL_GROUPS } from "../../data/skills.js";
import "./Skills.css";

const ALL = "All";

export default function Skills() {
  const sources = useMemo(() => {
    const seen = new Set();
    for (const g of SKILL_GROUPS) for (const s of g.items) s.from.forEach((f) => seen.add(f));
    return [ALL, ...seen];
  }, []);

  const [filter, setFilter] = useState(ALL);

  const total = useMemo(
    () => SKILL_GROUPS.reduce((n, g) => n + g.items.length, 0),
    []
  );

  const matching = useMemo(() => {
    if (filter === ALL) return total;
    return SKILL_GROUPS.reduce(
      (n, g) => n + g.items.filter((s) => s.from.includes(filter)).length,
      0
    );
  }, [filter, total]);

  return (
    <Section
      id="stack"
      eyebrow="Stack"
      title="What I actually work in"
      lede="Everything here is evidenced by something on this page. Filter by where it is used."
      aside={`${total} entries`}
    >
      <Reveal className="sk__filters">
        <div className="sk__chips" role="group" aria-label="Filter the stack by project">
          {sources.map((s) => (
            <button
              key={s}
              type="button"
              className={`sk__filter ${filter === s ? "is-on" : ""}`}
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="sk__count u-mono" aria-live="polite">
          {filter === ALL ? `${total} shown` : `${matching} of ${total} shown`}
        </p>
      </Reveal>

      <div className="sk__grid">
        {SKILL_GROUPS.map((g, i) => {
          const hits = g.items.filter(
            (s) => filter === ALL || s.from.includes(filter)
          ).length;

          return (
            <Reveal key={g.id} delay={i * 55}>
              <section
                className={`sk__group ${hits === 0 ? "is-empty" : ""}`}
                aria-labelledby={`sk-${g.id}`}
              >
                <header className="sk__group-head">
                  <h3 id={`sk-${g.id}`} className="sk__group-t">
                    {g.label}
                  </h3>
                  <span className="sk__group-n u-mono">
                    {String(g.items.length).padStart(2, "0")}
                  </span>
                </header>
                <p className="sk__group-hint">{g.hint}</p>

                <ul className="sk__list">
                  {g.items.map((s) => {
                    const on = filter === ALL || s.from.includes(filter);
                    return (
                      <li
                        key={s.name}
                        className={`sk__item ${on ? "" : "is-off"}`}
                      >
                        <span className="sk__dot" aria-hidden="true" />
                        {s.name}
                        <span className="u-sr"> — used in {s.from.join(", ")}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
