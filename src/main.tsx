import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { IntakeProvider } from "./context/intakeContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IntakeProvider>
      <App />
    </IntakeProvider>
  </StrictMode>
);