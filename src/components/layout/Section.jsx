import Reveal from "../ui/Reveal.jsx";
import "./Section.css";

export default function Section({ id, eyebrow, title, lede, aside, children }) {
  return (
    <section id={id} className="sec" aria-labelledby={`${id}-title`}>
      <div className="u-container">
        <Reveal as="header" className="sec__head">
          <div className="sec__top">
            <p className="u-eyebrow">{eyebrow}</p>
            {aside ? <p className="sec__aside">{aside}</p> : null}
          </div>
          <h2 id={`${id}-title`} className="sec__title">
            {title}
          </h2>
          {lede ? <p className="sec__lede u-measure">{lede}</p> : null}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
