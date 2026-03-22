import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary.tsx";

const rootElement = document.getElementById("root");

if (!rootElement) {
  // Last-resort fallback: #root missing from index.html
  document.body.innerHTML = `
    <div style="display:flex;min-height:100vh;align-items:center;justify-content:center;background:#09090b;font-family:sans-serif;padding:24px;text-align:center;">
      <div>
        <div style="font-size:48px;margin-bottom:16px;">⚡</div>
        <h1 style="color:#ffffff;font-size:24px;font-weight:900;margin-bottom:8px;">STEAimage</h1>
        <p style="color:#a1a1aa;">Fatal: #root element not found. Check index.html.</p>
      </div>
    </div>`;
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
