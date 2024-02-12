import React from "react";
import ReactDOM from "react-dom/client";
import dotenv from "dotenv";

import { App } from "./App";

// Import global CSS from Stellar Design System
import "@stellar/design-system/build/styles.min.css";

dotenv.config({ path: "../.env" });

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
