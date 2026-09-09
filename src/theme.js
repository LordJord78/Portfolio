/* JS-side mirror of the colour tokens. Only the WebGL hero needs colours
   in JS; everything else styles through the CSS custom properties in
   src/styles/tokens.css. Keep the two in sync. */

export const PALETTE = {
  dark: {
    page: "#08070c",
    low: "#191428",
    mid: "#9b6bff",
    high: "#c9b6ff",
    blue: "#5f8dff",
    /* Additive reads as emitted light on a black ground. On white it just
       washes out, so the light palette paints normally instead. */
    additive: true,
    opacity: 0.62,
  },
  light: {
    page: "#fbfafd",
    low: "#cfc6e6",
    mid: "#7b52e0",
    high: "#3a1f8f",
    blue: "#2f5bd0",
    additive: false,
    opacity: 0.78,
  },
};

