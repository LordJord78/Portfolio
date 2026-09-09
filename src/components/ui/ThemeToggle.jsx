import "./ThemeToggle.css";

export default function ThemeToggle({ theme, onToggle, className = "" }) {
  const dark = theme === "dark";

  return (
    <button
      type="button"
      className={`tt ${className}`.trim()}
      onClick={onToggle}
      aria-pressed={!dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
    >
      <span className="tt__track" aria-hidden="true">
        <svg className="tt__ic tt__ic--moon" viewBox="0 0 16 16" fill="none">
          <path
            d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8 5.6 5.6 0 1 0 13.2 9.6Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="tt__ic tt__ic--sun" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1m11-5-1.1 1.1M5.1 10.9 4 12m8 0-1.1-1.1M5.1 5.1 4 4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </button>
  );
}
