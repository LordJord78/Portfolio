import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import { ARC, STANDING } from "../../data/background.js";
import "./Background.css";

export default function Background() {
  return (
    <Section
      id="background"
      eyebrow="Background"
      title="Where I am, and what the year actually looked like"
      lede="No job titles to list yet. What there is instead is a record of the order things happened in, including the fortnight I spent chasing the wrong explanation."
      aside="Standing & arc"
    >
      <div className="bg">
        <Reveal className="bg__standing">
          <dl className="bg__facts">
            {STANDING.map((f) => (
              <div key={f.k}>
                <dt className="u-mono">{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div className="bg__arc">
          <Reveal as="h3" className="bg__arc-h">
            ES-ML-Trader
            <span className="bg__arc-note">in the order it happened</span>
          </Reveal>

          <ol className="bg__list">
            {ARC.map((step, i) => (
              <Reveal as="li" key={step.id} delay={i * 70} className="bg__step">
                <span className="bg__marker" aria-hidden="true" />
                <p className="bg__mark u-mono u-num">{step.mark}</p>
                <h4 className="bg__step-t">{step.title}</h4>
                <p className="bg__step-b">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
