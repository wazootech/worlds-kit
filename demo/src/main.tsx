import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createWorldsKitDataSource, WorldsKitApp } from "@wazootech/worlds-kit";
import App from "./App";
import "./styles.css";

const endpoint = import.meta.env.VITE_WORLDS_ENDPOINT;
const dataSource = endpoint ? createWorldsKitDataSource(endpoint, import.meta.env.VITE_WORLDS_TOKEN || undefined) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {dataSource ? <WorldsKitApp worldId="worlds-kit-demo" dataSource={dataSource}><App /></WorldsKitApp> : <p className="configuration-error">Set VITE_WORLDS_ENDPOINT to run the demo.</p>}
  </StrictMode>,
);
