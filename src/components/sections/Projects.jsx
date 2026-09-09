import { useId, useState } from "react";
import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import Button from "../ui/Button.jsx";
import GlowCard from "../ui/GlowCard.jsx";
import ProjectVisual from "./ProjectVisual.jsx";
import ProjectMedia from "./ProjectMedia.jsx";
import OrderBook from "./OrderBook.jsx";
import { PROJECTS } from "../../data/projects.js";
import "./Projects.css";

/* A project shows real footage where it has any, and the generated diagram
   where it does not. */
function Visual({ project }) {
  return project.media ? (
    <ProjectMedia {...project.media} />
  ) : (
    <ProjectVisual motif={project.motif} />
  );
}

function Meta({ project }) {
  return (
    <p className="pj__meta u-mono">
      <span>{project.kind}</span>
      <span aria-hidden="true">·</span>
      <span>{project.year}</span>
    </p>
  );
}

function Links({ project, extra }) {
  if (!project.links.length && !extra) {
    return (
      <p className="pj__nolink u-mono">Source not public</p>
    );
  }

  return (
    <div className="pj__links">
      {extra}
      {project.links.map((l) => (
        <Button key={l.href} href={l.href} size="sm" arrow>
          {l.label}
        </Button>
      ))}
    </div>
  );
}

function Featured({ project }) {
  return (
    <Reveal>
      <GlowCard as="article" className="pj__feature" aria-labelledby={`${project.id}-h`}>
        <div className="pj__feature-body">
          <Meta project={project} />
          <h3 id={`${project.id}-h`} className="pj__title pj__title--lg">
            {project.title}
          </h3>
          <p className="pj__tag">{project.tagline}</p>
          <p className="pj__body">{project.problem}</p>

          <ul className="pj__highlights">
            {project.highlights.map((h) => (
              <li key={h.label}>
                <span className="pj__hv u-mono u-num">{h.value}</span>
                <span className="pj__hk">{h.label}</span>
              </li>
            ))}
          </ul>

          <div className="tag-row pj__stack">
            {project.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>

          <Links
            project={project}
            extra={
              <Button href="#research" variant="primary" size="sm" arrow>
                Read the full research
              </Button>
            }
          />
        </div>

        <div className="pj__feature-visual par par--soft">
          <OrderBook />
          <p className="pj__caption u-mono">
            Synthetic ES book — illustrative, not live market data
          </p>
        </div>
      </GlowCard>
    </Reveal>
  );
}

function Card({ project, delay }) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const panelId = `${uid}-detail`;

  return (
    <Reveal delay={delay}>
      <GlowCard as="article" className="pj__card" aria-labelledby={`${project.id}-h`}>
        <Visual project={project} />

        <div className="pj__card-body">
          <Meta project={project} />
          <h3 id={`${project.id}-h`} className="pj__title">
            {project.title}
          </h3>
          <p className="pj__tag pj__tag--sm">{project.tagline}</p>
          <p className="pj__body">{project.problem}</p>

          {project.details ? (
            <>
              <button
                type="button"
                className="pj__more"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls={panelId}
              >
                <span className={`pj__more-ic ${open ? "is-open" : ""}`} aria-hidden="true" />
                {open ? "Hide the detail" : "How it works"}
              </button>

              {open ? (
                <ul id={panelId} className="pj__detail">
                  {project.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ) : null}
            </>
          ) : null}

          <div className="tag-row pj__stack">
            {project.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </div>

          <Links project={project} />
        </div>
      </GlowCard>
    </Reveal>
  );
}

export default function Projects() {
  const [featured, ...rest] = PROJECTS;

  return (
    <Section
      id="work"
      eyebrow="Selected work"
      title="Systems I built to find out whether I was right"
      lede="Three projects, one habit: build the measurement before you trust the result."
      aside={`${String(PROJECTS.length).padStart(2, "0")} projects`}
    >
      <div className="pj">
        <Featured project={featured} />
        <div className="pj__grid">
          {rest.map((p, i) => (
            <Card key={p.id} project={p} delay={90 * (i + 1)} />
          ))}
        </div>
      </div>
    </Section>
  );
}
