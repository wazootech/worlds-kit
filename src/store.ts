import type {
  WorldsKitDataSource,
  WorldsKitItem,
  WorldsKitSubscription,
} from "./types";
import { itemQuery, normalizeItem } from "./store-items";
import {
  bindingValue,
  encodeIri,
  itemIri,
  predicateIri,
  queryBindings,
} from "./worlds";

export {
  addDatasetItem,
  saveValue,
  updateDatasetItem,
  updateDatasetOrder,
  updateItem,
} from "./store-mutations";

export function subscribeToDataset(
  dataSource: WorldsKitDataSource,
  worldId: string,
  parentId: string,
  datasetId: string,
  onItems: (items: WorldsKitItem[]) => void,
  onError: (error: Error) => void,
): WorldsKitSubscription {
  const sparql = itemQuery(worldId, parentId, datasetId);
  const processResult = (result: unknown) => {
    const items = queryBindings(result).map((row) =>
      normalizeItem(row, worldId),
    );
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
    onItems(items);
  };
  if (dataSource.subscribe)
    return dataSource.subscribe(sparql, processResult, onError, { worldId });
  let active = true;
  const controller = new AbortController();
  void dataSource
    .query(sparql, {
      worldId,
      signal: controller.signal,
    })
    .then((result) => {
      if (active) processResult(result);
    })
    .catch((error) => {
      if (active && error.name !== "AbortError") onError(error);
    });
  return () => {
    active = false;
    controller.abort();
  };
}

export function subscribeToValue<T>(
  dataSource: WorldsKitDataSource,
  worldId: string,
  itemId: string,
  onValue: (value: T) => void,
  onError: (error: Error) => void,
): WorldsKitSubscription {
  const sparql = `SELECT ?value WHERE { ${encodeIri(itemIri(worldId, itemId))} <${predicateIri("value")}> ?value }`;
  if (dataSource.subscribe)
    return dataSource.subscribe(
      sparql,
      (result) =>
        onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T),
      onError,
      { worldId },
    );
  let active = true;
  const controller = new AbortController();
  void dataSource
    .query(sparql, {
      worldId,
      signal: controller.signal,
    })
    .then((result) => {
      if (active)
        onValue((bindingValue(queryBindings(result)[0]?.value) ?? "") as T);
    })
    .catch((error) => {
      if (active && error.name !== "AbortError") onError(error);
    });
  return () => {
    active = false;
    controller.abort();
  };
}

export function subscribeToDatasetItem(
  dataSource: WorldsKitDataSource,
  worldId: string,
  parentId: string,
  datasetId: string,
  id: string,
  onItem: (item: WorldsKitItem | null) => void,
  onError: (error: Error) => void,
): WorldsKitSubscription {
  return subscribeToDataset(
    dataSource,
    worldId,
    parentId,
    datasetId,
    (items) => onItem(items.find((item) => item.id === id) ?? null),
    onError,
  );
}
