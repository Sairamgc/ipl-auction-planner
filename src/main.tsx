import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element #root not found");

createRoot(rootElement).render(
  <StrictMode>
    <h1 className="p-4 text-2xl font-semibold">IPL Auction Planner</h1>
  </StrictMode>,
);
