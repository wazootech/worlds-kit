import { createContext, useContext, useState, type ReactNode } from "react";
import type { WorldsClient } from "./types";

type WorldsKitState = { worldId: string; client: WorldsClient; activeSourceId: string | null; setActiveSourceId: (id: string | null) => void };
const WorldsKitContext = createContext<WorldsKitState | null>(null);
const ItemContext = createContext<string | null>(null);

export function WorldsKitApp({ worldId, client, children }: { worldId: string; client: WorldsClient; children: ReactNode }) {
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  return <WorldsKitContext.Provider value={{ worldId, client, activeSourceId, setActiveSourceId }}>{children}</WorldsKitContext.Provider>;
}

export function useWorldsKit() {
  const value = useContext(WorldsKitContext);
  if (!value) throw new Error("WorldsKit components must be rendered inside WorldsKitApp.");
  return value;
}

export function useSelectedItem() { return useContext(ItemContext); }
export function useParentItem() { return useContext(ItemContext); }
export const ItemProvider = ItemContext.Provider;
