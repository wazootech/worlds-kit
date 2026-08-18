import {
  createContext,
  useContext,
  useState,
  type Context,
  type ReactNode,
} from "react";
import type { WorldsKitDataSource } from "./types";

type WorldsKitState = {
  worldId: string;
  dataSource: WorldsKitDataSource;
  activeSourceId: string | null;
  setActiveSourceId: (id: string | null) => void;
};
const WorldsKitContext = createContext<WorldsKitState | null>(null);
const ItemContext: Context<string | null> = createContext<string | null>(null);

export function WorldsKitApp({
  worldId,
  dataSource,
  children,
}: {
  worldId: string;
  dataSource: WorldsKitDataSource;
  children: ReactNode;
}): ReactNode {
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  return (
    <WorldsKitContext.Provider
      value={{ worldId, dataSource, activeSourceId, setActiveSourceId }}
    >
      {children}
    </WorldsKitContext.Provider>
  );
}

export function useWorldsKit(): WorldsKitState {
  const value = useContext(WorldsKitContext);
  if (!value)
    throw new Error(
      "WorldsKit components must be rendered inside WorldsKitApp.",
    );
  return value;
}

export function useSelectedItem(): string | null {
  return useContext(ItemContext);
}
export function useParentItem(): string | null {
  return useContext(ItemContext);
}
export const ItemProvider = ItemContext.Provider;
