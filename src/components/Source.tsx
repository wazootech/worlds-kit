import { cloneElement, type ReactElement } from "react";
import { useWorldsKit } from "../context";
import type { DatasetProps } from "../types";

export function Source({ children }: { children: ReactElement<DatasetProps> }) {
  const { activeSourceId, setActiveSourceId } = useWorldsKit();
  return cloneElement(children, {
    isSource: true,
    selectedId: activeSourceId,
    onSelect: setActiveSourceId,
  });
}
