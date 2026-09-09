import { EMAIL, GITHUB, NAME, SOCIALS } from "../../data/profile.js";
import "./Footer.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="ft">
      <div className="u-container ft__in">
        <div className="ft__left">
          <p className="ft__name">{NAME}</p>
          <p className="ft__meta u-mono">
            Built with React, Vite and three.js. No trackers.
          </p>
        </div>

        <nav className="ft__links" aria-label="Elsewhere">
          <a className="a-link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              className="a-link"
              href={s.href}
              target="_blank"
              rel="noreferrer noopener"
            >
              {s.label}
            </a>
          ))}
        </nav>

        <p className="ft__legal u-mono">
          © {year} · <a className="a-link" href={GITHUB} target="_blank" rel="noreferrer noopener">source</a>
        </p>
      </div>
    </footer>
  );
}
