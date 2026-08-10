import { useEffect, useState } from "react";
import { useWorldsKit } from "../context";
import { subscribeToDatasetItem, updateDatasetItem } from "../store";
import type { ItemUpdates, WorldsKitItem } from "../types";

export function useBoundItem(
  itemId: string,
  datasetId: string,
  parentId: string,
) {
  const { dataSource, worldId } = useWorldsKit();
  const [item, setItem] = useState<WorldsKitItem>({ id: itemId });

  useEffect(() => {
    return subscribeToDatasetItem(
      dataSource,
      worldId,
      parentId,
      datasetId,
      itemId,
      (value) => value && setItem(value),
      () => {},
    );
  }, [dataSource, datasetId, itemId, parentId, worldId]);

  return {
    item,
    update: (updates: ItemUpdates) =>
      updateDatasetItem(
        dataSource,
        worldId,
        parentId,
        datasetId,
        itemId,
        updates,
      ),
  };
}
