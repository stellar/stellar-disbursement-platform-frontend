console.log("[DisbursementStudio] src/index.tsx execution started");

import React from "react";

import { createRoot } from "react-dom/client";

import { App } from "./App";

// Import our custom Tailwind stylesheet. This provides baseline reset and utilities.
console.log("[DisbursementStudio] Importing studio.css (Tailwind v4)...");
import "./styles/studio.css";

console.log("[DisbursementStudio] Finding root container...");
const container = document.getElementById("root");
if (container) {
  console.log("[DisbursementStudio] Root container found. Initializing React root...");
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log("[DisbursementStudio] React root.render called.");
} else {
  console.error("[DisbursementStudio] Root container NOT found in DOM!");
}
