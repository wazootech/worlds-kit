import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createWorldsClient, WorldsKitApp } from "@wazootech/worlds-kit";
import App from "./App";
import "./styles.css";

const endpoint = import.meta.env.VITE_WORLDS_ENDPOINT;
const client = endpoint ? createWorldsClient(endpoint, import.meta.env.VITE_WORLDS_TOKEN || undefined) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {client ? <WorldsKitApp worldId="worlds-kit-demo" client={client}><App /></WorldsKitApp> : <p className="configuration-error">Set VITE_WORLDS_ENDPOINT to run the demo.</p>}
  </StrictMode>,
);
