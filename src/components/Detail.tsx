import { type ReactNode } from "react";
import { ItemProvider, useWorldsKit } from "../context";

export function Detail({ children }: { children: ReactNode }) {
  const { activeSourceId } = useWorldsKit();
  if (!activeSourceId) {
    return <div className="worlds-kit-empty-state">Select an item...</div>;
  }
  return <ItemProvider value={activeSourceId}>{children}</ItemProvider>;
}
