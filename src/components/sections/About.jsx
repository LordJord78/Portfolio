import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import headshotPng from "../../assets/headshot.png";
import headshotWebp from "../../assets/headshot.webp";
import "./About.css";

/* Every line here is drawn from the project write-ups in /content. */
const PRINCIPLES = [
  {
    k: "Set the pass mark first",
    v: "A threshold chosen after seeing the output means nothing. Write it down before you look.",
  },
  {
    k: "Declared discipline isn't discipline",
    v: "A holdout guard that nothing calls is decoration. Make the code refuse.",
  },
  {
    k: "Excluded is not zero",
    v: "A cost you left out of the model is still a cost you pay in the market.",
  },
];

/* <picture> only falls back when a source's *type* is unsupported. If the
   browser picks the WebP and then fails to decode it — a corrupt cache, a
   proxy that rewrote the bytes, an old renderer — the <img> errors and
   stays blank. So on error the WebP source is dropped and the PNG is
   requested directly. Guarded so a PNG failure cannot loop. */
function onPortraitError(e) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "png";
  img.parentElement?.querySelector("source")?.remove();
  img.src = headshotPng;
}

export default function About() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title="I care about the part most people skip: whether a result is real"
      aside="Who is writing this"
    >
      <div className="ab">
        <Reveal className="ab__side par--soft par">
          <figure className="ab__portrait">
            {/* WebP is a tenth of the PNG; the PNG stays as the fallback. */}
            <picture>
              <source srcSet={headshotWebp} type="image/webp" />
              <img
                src={headshotPng}
                alt="Jordan Craig"
                width="329"
                height="329"
                loading="lazy"
                decoding="async"
                onError={onPortraitError}
              />
            </picture>
            <span className="ab__portrait-edge" aria-hidden="true" />
          </figure>

          {/* His own words, from content/es-ml-trader-project-page.md. */}
          <blockquote className="ab__quote">
            <p>
              “Two weeks to discover my code was right and my test was
              wrong.”
            </p>
            <footer className="u-mono">on validating the order book</footer>
          </blockquote>

        </Reveal>

        <div className="ab__main">
          <Reveal as="div" className="prose ab__prose">
            <p>
              I’m working through a mathematics pathway at Solano Community
              College, aiming to transfer into financial mathematics and
              statistics. Most of what I know about markets I learned by
              building things that didn’t work and finding out exactly why.
            </p>
            <p>
              Nearly every trading strategy looks profitable until you account
              for what it costs to trade it, and nearly every model looks
              predictive until you check what it saw during training. So the
              first thing I build is the thing that can prove me wrong — the
              cost model, the leakage check, the holdout the code won’t let me
              open. What survives that is worth talking about.
            </p>
            <p>
              The same instinct shows up away from markets: a voxel game engine
              is only interesting to me because the simulation is deterministic
              and hash-verified, which is what turns a physics bug from an
              anecdote into something reproducible.
            </p>
          </Reveal>

          <Reveal as="ul" className="ab__principles" delay={90}>
            {PRINCIPLES.map((p) => (
              <li key={p.k}>
                <span className="ab__p-k">{p.k}</span>
                <span className="ab__p-v">{p.v}</span>
              </li>
            ))}
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
