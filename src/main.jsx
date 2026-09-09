import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { readStoredTheme } from "./hooks/useTheme.js";
import "./index.css";

/* Apply the stored theme before the first paint so there is no flash of the
   wrong palette. index.html does the same inline for the very first load. */
document.documentElement.setAttribute("data-theme", readStoredTheme());

if (import.meta.env.PROD) {
  console.log(
    "%cJordan Craig%c  ↑↑↓↓←→←→BA",
    "font-weight:700;color:#c9b6ff",
    "color:#746c89"
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
