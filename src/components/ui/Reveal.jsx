import useInView from "../../hooks/useInView.js";

/* Fades a block up the first time it enters the viewport. Purely additive:
   under reduced motion the CSS keeps it visible from the start. */
export default function Reveal({
  as: Tag = "div",
  delay = 0,
  y,
  className = "",
  children,
  ...rest
}) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "is-in" : ""} ${className}`.trim()}
      style={{
        "--reveal-delay": `${delay}ms`,
        ...(y != null ? { "--reveal-y": `${y}px` } : null),
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
