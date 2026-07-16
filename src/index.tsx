import React from "react";

import ReactDOM from "react-dom/client";

import { App } from "./App";

// Import global CSS from Stellar Design System
import "@stellar/design-system/build/styles.min.css";

// =========================================================================
// DEMO MODE — auto-enabled by default so this runs standalone with no
// backend, using realistic sample data. It auto-logs-in and mocks all API
// calls (see helpers/demoApiMock.ts).
//
// When your real backend is ready, switch back to live mode by running this
// once in the browser console, then reloading:
//   localStorage.setItem("sdp_live_mode", "true");
//   localStorage.removeItem("sdp_session");
// =========================================================================
const DEMO_SESSION_TOKEN =
  "eyJhbGciOiAibm9uZSIsICJ0eXAiOiAiSldUIn0.eyJ1c2VyIjogeyJpZCI6ICJkZW1vLXVzZXItaWQiLCAiZW1haWwiOiAiZGVtb0BkaXNidXJzZWZsb3cub3JnIiwgInJvbGVzIjogWyJvd25lciJdfSwgImV4cCI6IDQ4NDQxMzk3OTN9.fakesignature";

if (localStorage.getItem("sdp_live_mode") !== "true") {
  localStorage.setItem("sdp_demo_mode", "true");
  if (!localStorage.getItem("sdp_session")) {
    localStorage.setItem("sdp_session", DEMO_SESSION_TOKEN);
  }
  const { installDemoApiMock } = await import("./helpers/demoApiMock");
  installDemoApiMock();
}

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
