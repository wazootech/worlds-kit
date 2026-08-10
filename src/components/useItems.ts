import { useEffect, useState } from "react";
import { useWorldsKit } from "../context";
import { subscribeToDataset } from "../store";
import type { WorldsKitItem } from "../types";

export function useItems(datasetId: string, parentId: string | null) {
  const { worldId, dataSource } = useWorldsKit();
  const resolvedParentId = parentId ?? "root";
  const [items, setItems] = useState<WorldsKitItem[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setError(null);
    return subscribeToDataset(
      dataSource,
      worldId,
      resolvedParentId,
      datasetId,
      setItems,
      setError,
    );
  }, [dataSource, datasetId, resolvedParentId, worldId]);

  return { items, error };
}
