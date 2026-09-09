import { useEffect, useRef } from "react";

import useInView from "../../hooks/useInView.js";
import useReducedMotion from "../../hooks/useReducedMotion.js";
import "./ProjectMedia.css";

/* Real capture rather than a generated diagram, so unlike ProjectVisual it
   carries a label instead of aria-hidden. Two concessions: under reduced
   motion the poster frame stands in for the clip, and the clip pauses when
   it scrolls out of view — the same bargain the hero makes with its render
   loop. */
export default function ProjectMedia({ src, poster, alt }) {
  const reduced = useReducedMotion();
  const [frame, inView] = useInView({ once: false, initial: true });
  const video = useRef(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    if (inView) {
      /* Autoplay can still be refused; the poster stays up if it is. */
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [inView, reduced]);

  return (
    <div className="pv__frame pv__frame--media" ref={frame}>
      {reduced ? (
        <img className="pv pv--media" src={poster} alt={alt} />
      ) : (
        <video
          ref={video}
          className="pv pv--media"
          src={src}
          poster={poster}
          aria-label={alt}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
