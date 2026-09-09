import React, { useMemo } from "react";

/* Word-level stagger. Splitting on words rather than characters keeps the
   text selectable, searchable and readable to a screen reader. */
export default function SplitText({ text, delay = 0, step = 42, className = "" }) {
  const words = useMemo(() => text.split(" "), [text]);

  return (
    <span className={`split ${className}`.trim()}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="split__w" style={{ "--d": `${delay + i * step}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </span>
  );
}
