import "./controls.css";

const Arrow = () => (
  <svg
    className="btn__ic"
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 7h9M7.5 3.2 11.3 7l-3.8 3.8"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* Renders a real <a> when it navigates and a real <button> when it acts. */
export default function Button({
  href,
  variant = "ghost",
  size,
  arrow = false,
  className = "",
  children,
  ...rest
}) {
  const cls = [
    "btn",
    `btn--${variant}`,
    size === "sm" ? "btn--sm" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const inner = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );

  if (href) {
    const external = /^https?:/.test(href);
    return (
      <a
        className={cls}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer noopener" } : null)}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}
