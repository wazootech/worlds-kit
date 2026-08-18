import { cloneElement, type ReactElement, type ReactNode } from "react";
import { useWorldsKit } from "../context";
import type { DatasetProps } from "../types";

export function Source({
  children,
}: {
  children: ReactElement<DatasetProps>;
}): ReactNode {
  const { activeSourceId, setActiveSourceId } = useWorldsKit();
  return cloneElement(children, {
    isSource: true,
    selectedId: activeSourceId,
    onSelect: setActiveSourceId,
  });
}
