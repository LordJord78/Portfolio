import { useCallback, useEffect, useRef, useState } from "react";
import Section from "../layout/Section.jsx";
import Reveal from "../ui/Reveal.jsx";
import { EMAIL, SOCIALS } from "../../data/profile.js";
import "./Contact.css";

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      /* Clipboard blocked — the mailto link beside this still works. */
      window.location.href = `mailto:${EMAIL}`;
    }
  }, []);

  return (
    <Section id="contact" eyebrow="Contact" title="Get in touch" aside="Say hello">
      <Reveal className="ct">
        <div className="ct__grid" aria-hidden="true" />

        <div className="ct__body">
          <p className="ct__lead">
            If you are working on market microstructure, machine learning
            research, or anything that has to be measured properly before it is
            believed — I would like to hear about it.
          </p>

          <div className="ct__email">
            <a className="ct__addr u-mono" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <button
              type="button"
              className="ct__copy"
              onClick={copy}
              aria-label={`Copy ${EMAIL} to the clipboard`}
            >
              <span className="ct__copy-in" aria-hidden="true">
                {copied ? "Copied" : "Copy"}
              </span>
            </button>
            <span role="status" aria-live="polite" className="u-sr">
              {copied ? "Email address copied to clipboard" : ""}
            </span>
          </div>

          <ul className="ct__socials">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer noopener">
                  <span className="ct__social-l">{s.label}</span>
                  <span className="ct__social-h u-mono">{s.handle}</span>
                  <svg
                    className="ct__social-ic"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3.2 8.8 8.8 3.2M4.4 3.2h4.4v4.4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </Section>
  );
}
